import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserInfoService } from './user-info.service';
import {
  ErrorResponseModel,
  PaginationSet,
  ResponseContentModel,
} from '../common/models/response';
import {
  AddressDto,
  UpdateUserInformationDto,
} from '../common/models/dto/user-info.dto';
import { UserInformation } from '../common/models/schema/user-info.schema';
import { AuthGuard } from '../common/middleware/auth.middleware';

@Controller('user-info')
export class UserInfoController {
  constructor(private readonly userInfoService: UserInfoService) {}

  @Put()
  @UseGuards(AuthGuard)
  async updateUserInformation(
    @Request() req: any,
    @Body() updateUserInformationDto: UpdateUserInformationDto,
  ) {
    try {
      const userId = req.user.sub;

      const response = await this.userInfoService.updateUserInformation(
        userId,
        updateUserInformationDto,
      );

      return new ResponseContentModel<any>(
        200,
        'Cập nhập thông tin thành công',
        response,
      );
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }

  @Get('user')
  @UseGuards(AuthGuard)
  async getUserInfoByUser(@Request() req: any) {
    try {
      const userId = req.user.sub;

      const userInfo = await this.userInfoService.getUserInfoByUser(userId);

      return new ResponseContentModel<UserInformation>(
        200,
        'Lấy thông tin thành công',
        userInfo,
      );
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }

  @Post('update/address')
  @UseGuards(AuthGuard)
  async addAddress(@Request() req: any, @Body() addressDto: AddressDto) {
    try {
      const userId = req.user.sub;

      const response = await this.userInfoService.addAddress(
        userId,
        addressDto,
      );

      return new ResponseContentModel<any>(201, 'Thành công', response);
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }

  @Get('user-information/address')
  @UseGuards(AuthGuard)
  async listAddress(
    @Request() req: any,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ) {
    try {
      const userId = req.user.sub;

      const response = await this.userInfoService.listAddress(
        userId,
        page,
        pageSize,
      );

      return new ResponseContentModel<PaginationSet<any>>(
        200,
        'Thành công',
        response,
      );
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }
}
