import {
  BadGatewayException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  LoginUserDto,
  RegisterDto,
  SetPasswordDto,
  VerifyOtpDto,
} from '../common/models/dto/user.dto';
import {
  ErrorResponseModel,
  PaginationSet,
  ResponseContentModel,
} from '../common/models/response';
import { User } from '../common/models/schema/user.schema';
import { AuthGuard } from '../common/middleware/auth.middleware';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  //#region Đăng ký
  @Post('register')
  async register(@Body() data: RegisterDto) {
    try {
      const response = await this.userService.registerUser(data);

      return new ResponseContentModel<any>(
        201,
        'Đăng ký mail thành công',
        response,
      );
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }

  @Post('verify-otp')
  async verifyOtp(@Body() data: VerifyOtpDto) {
    try {
      const response = await this.userService.verifyOtp(data);

      return new ResponseContentModel<any>(
        200,
        'Xác mình mã OTP thành công',
        response,
      );
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }

  @Post('register-password')
  async setPassword(@Body() data: SetPasswordDto) {
    try {
      const response = await this.userService.setPassword(data);

      return new ResponseContentModel<any>(
        201,
        'Thiết lập mật khẩu thành công',
        response,
      );
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }
  //#endregion

  //#region Đăng nhập và đăng xuất
  @Post('login')
  async loginUser(@Body() data: LoginUserDto) {
    try {
      const response = await this.userService.login(data);

      return new ResponseContentModel<any>(
        200,
        'Đăng nhập thành công',
        response,
      );
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logoutUser(@Req() req: Request) {
    try {
      const authorization = req.headers['authorization'];
      const token = authorization?.replace('Bearer ', '');
      if (!token) {
        throw new BadGatewayException('Token không hợp lệ');
      }

      const response = await this.userService.logout(token);

      return new ResponseContentModel<any>(
        200,
        'Đăng xuất thành công',
        response,
      );
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }
  //#endregion

  //#region CRUD
  @Get()
  @UseGuards(AuthGuard)
  async list(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    try {
      const response = await this.userService.list(page, limit, search, status);

      return new ResponseContentModel<PaginationSet<User>>(
        200,
        'Lấy danh sách thành công',
        response,
      );
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi xảy ra', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }

  @Get('detail')
  @UseGuards(AuthGuard)
  async detail(@Request() req: any) {
    try {
      const userId = req.user?.sub;
      const response = await this.userService.detail(userId);

      return new ResponseContentModel<User>(
        200,
        'Lấy danh sách thành công',
        response,
      );
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi xảy ra', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }
  //#endregion

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    try {
      const response = await this.userService.forgotPassword(email);

      return new ResponseContentModel<any>(201, 'Mã OTP đã được gửi', response);
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }
}
