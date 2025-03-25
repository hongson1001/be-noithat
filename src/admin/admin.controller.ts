import {
  BadGatewayException,
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto, LoginAdminDto } from '../common/models/dto/admin.dto';
import {
  ErrorResponseModel,
  ResponseContentModel,
} from '../common/models/response';
import { AuthGuard } from '../common/middleware/auth.middleware';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  async create(@Body() data: CreateAdminDto) {
    try {
      const response = await this.adminService.create(data);

      return new ResponseContentModel(
        201,
        'Tạo thành tài khoản thành công',
        response,
      );
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }

  @Post('login')
  async login(@Body() data: LoginAdminDto) {
    try {
      const response = await this.adminService.login(data);

      return new ResponseContentModel(200, 'Đăng nhập thành công', response);
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(@Req() req: Request) {
    try {
      const authorization = req.headers['authorization'];
      const token = authorization?.replace('Bearer ', '');
      if (!token) {
        throw new BadGatewayException('Token không hợp lệ');
      }

      const response = await this.adminService.logout(token);
      return new ResponseContentModel(200, 'Đăng xuất thành công', response);
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }
}
