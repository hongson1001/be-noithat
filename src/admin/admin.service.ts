import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Admin, AdminDocument } from '../common/models/schema/admin.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { TokenBlacklistService } from '../common/utils/tokenblacklist/tokenblacklist.service';
import { JwtService } from '@nestjs/jwt';
import { CreateAdminDto, LoginAdminDto } from '../common/models/dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name)
    private readonly adminModel: Model<AdminDocument>,

    private readonly tokenService: TokenBlacklistService,
    private readonly jwtService: JwtService,
  ) {}

  async create(data: CreateAdminDto): Promise<Admin> {
    const admin = new this.adminModel(data);
    await admin.save();

    return admin;
  }

  async login(data: LoginAdminDto): Promise<any> {
    const admin = await this.adminModel
      .findOne({ username: data.username })
      .exec();
    if (!admin) {
      throw new NotFoundException(
        ` Không tìm thấy tài khoản: ${data.username} `,
      );
    }

    const isPasswordValid = await bcrypt.compare(data.password, admin.password);
    if (!isPasswordValid) {
      throw new NotFoundException('Mật khẩu không đúng');
    }

    const payload = {
      sub: admin._id,
      username: admin.username,
      role: admin.role,
    };

    try {
      const token = this.jwtService.sign(payload);
      return { accessToken: token };
    } catch (error) {
      throw new Error('Lỗi không lấy được token: ' + (error as Error).message);
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
}
