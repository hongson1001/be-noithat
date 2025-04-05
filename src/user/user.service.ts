import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../common/models/schema/user.schema';
import { Model } from 'mongoose';
import {
  UserInformation,
  UserInformationDocument,
} from '../common/models/schema/user-info.schema';
import { JwtService } from '@nestjs/jwt';
import { TokenBlacklistService } from '../common/utils/tokenblacklist/tokenblacklist.service';
import { CustomerMailerService } from '../common/utils/customer-mailer/customer-mailer.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import {
  LoginUserDto,
  RegisterDto,
  SetPasswordDto,
  VerifyOtpDto,
} from '../common/models/dto/user.dto';
import { sendLogsTelegram } from '../common/utils/send-logs';
import { PaginationSet } from '../common/models/response';
import { genStatusLabel } from '../common/utils/status.util';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(UserInformation.name)
    private readonly uiModel: Model<UserInformationDocument>,

    private readonly jwtService: JwtService,
    private readonly tokenService: TokenBlacklistService,
    private readonly mailerService: CustomerMailerService,
  ) {}

  //#region Đăng ký tài khoản
  async registerUser(data: RegisterDto): Promise<any> {
    const user = await this.userModel.findOne({ email: data.email }).exec();
    if (user) {
      throw new NotFoundException('Tài khoản đã tồn tại');
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 50 * 1000);

    const newUser = new this.userModel({
      email: data.email,
      otp,
      otpExpiresAt,
      isVerified: false,
    });
    await newUser.save();

    const newUI = new this.uiModel({
      userId: newUser._id,
      email: data.email,
    });
    await newUI.save();

    await this.mailerService.sendMail({
      to: data.email,
      subject: 'Xác mình tài khoản của bạn',
      text: ` Đây là mã OTP của bạn: ${otp}. Mã OTP sẽ hết hạn sau 5 phút. Vui lòng không cung cấp mã này cho bất kỳ ai `,
    });
    const message = `Đây là mã OTP của bạn: ${otp} của tài khoản ${data.email}. Mã OTP sẽ hết hạn sau 5 phút. Vui lòng không cung cấp mã này cho bất kỳ ai`;
    await sendLogsTelegram(message);

    return ` Mã OTP đã được gửi tới email: ${data.email} của bạn `;
  }

  async verifyOtp(data: VerifyOtpDto): Promise<any> {
    const user = await this.userModel.findOne({ email: data.email }).exec();
    if (!user) {
      throw new BadRequestException('Email không tồn tại');
    }

    if (user.otp !== data.otp) {
      throw new BadRequestException(` Mã OTP: ${data.otp} không chính xác `);
    }

    if (new Date() > user.otpExpiresAt) {
      throw new BadRequestException('OTP của bạn đã hết hạn');
    }

    user.otp = undefined;
    user.otpExpiresAt = undefined;
    user.isVerified = true;
    await user.save();

    return 'Xác mình mã OTP thành công';
  }

  async setPassword(data: SetPasswordDto): Promise<any> {
    const user = await this.userModel.findOne({ email: data.email }).exec();
    if (!user) {
      throw new NotFoundException(` KHông tìm thấy email: ${data.email} `);
    }

    if (user.otp || user.otpExpiresAt) {
      throw new BadRequestException('Vui lòng xác minh OTP trước');
    }

    user.password = data.password;
    await user.save();

    await this.mailerService.sendMail({
      to: data.email,
      subject: 'Tạo tài khoản thành công',
      html: ` 
          <p>Bạn đã tạo tài khoản thành công với:</p>
          <p>Tài khoản: ${data.email}</p>
          <p>Mật khẩu: ${data.password}</p>
          <p>Vui lòng không cung cấp tài khoản với bất kỳ ai</p>
          <p>Shop Fashion, trân trọng</p>
          `,
    });

    return 'Tài khoản đã được tạo thành công';
  }
  //#endregion

  //#region Đăng nhập và đăng xuất
  async login(data: LoginUserDto): Promise<any> {
    const user = await this.userModel.findOne({ email: data.email }).exec();
    if (!user) {
      throw new NotFoundException(`Email: ${data.email} không tồn tại`);
    }
    if (user.status !== 'active') {
      throw new BadRequestException(
        'Tài khoản của bạn cần được mở khoá để đăng nhập',
      );
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new NotFoundException('Mật khẩu không chính xác');
    }

    const payload = {
      email: user.email,
      sub: user._id,
    };
    const tokenExpiry = data.isResmember ? '30d' : '24h';

    try {
      const token = await this.jwtService.signAsync(payload, {
        expiresIn: tokenExpiry,
      });

      return { accessToken: token };
    } catch (error: unknown) {
      throw new Error('Lỗi không tạo được token' + (error as Error).message);
    }
  }

  async logout(token: string): Promise<any> {
    try {
      const decodedToken = this.jwtService.decode(token) as {
        sub: string;
        exp: number;
      };
      if (!decodedToken) {
        throw new Error('Token không hợp lệ');
      }

      const expiresIn = (decodedToken.exp = Math.floor(Date.now() / 1000));
      await this.tokenService.addTokenToBlacklist(token, expiresIn);

      return 'Đăng xuất thành công';
    } catch (error) {
      throw new Error('Không thể đăng xuất : ' + (error as Error).message);
    }
  }
  //#endregion

  //#region CRUD
  async list(
    page: number,
    limit: number,
    search?: string,
    status?: string,
  ): Promise<PaginationSet<User>> {
    const skip = (page - 1) * limit;
    const filter: Record<string, any> = {};

    if (search) {
      filter.$or = [{ email: { $regex: search, $options: 'i' } }];
    }
    if (status) {
      filter.status = status;
    }

    const [data, totalItems] = await Promise.all([
      this.userModel.find(filter).skip(skip).limit(limit).exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);
    const dataWithStatus = data.map((u) => ({
      ...u.toObject(),
      statusLabel: genStatusLabel(u.status),
    }));

    return new PaginationSet(totalItems, page, limit, dataWithStatus);
  }

  async detail(userId: string): Promise<any> {
    const user = await this.userModel
      .findById(userId)
      .select('-isVerified -password')
      .exec();
    if (!user) {
      throw new NotFoundException('Không tìm tháy tài khoản');
    }

    const ui = await this.uiModel.findOne({ userId: user._id }).exec();
    const statusLabel = genStatusLabel(user.status);

    return {
      user: {
        ...user.toObject(),
        statusLabel,
      },
      userInfomation: ui || null,
    };
  }
  //#endregion

  //Quên mật khẩu
  async forgotPassword(email: string): Promise<any> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new NotFoundException('Email không tồn tại');
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    await this.mailerService.sendMail({
      to: email,
      subject: 'Khôi phục mật khẩu - OTP của bạn',
      text: `Mã OTP của bạn là: ${otp}. Mã sẽ hết hạn sau 5 phút.`,
    });

    await sendLogsTelegram(
      `OTP quên mật khẩu cho ${email}: ${otp} (hết hạn sau 5 phút)`,
    );

    return 'Mã OTP đã được gửi tới email của bạn';
  }
}
