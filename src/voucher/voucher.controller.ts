import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { VoucherService } from './voucher.service';
import {
  CreateVoucherDto,
  UpdateVoucherDto,
} from '../common/models/dto/voucher.dto';
import {
  ErrorResponseModel,
  ResponseContentModel,
} from '../common/models/response';
import { AuthGuard } from '../common/middleware/auth.middleware';

@Controller('voucher')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() data: CreateVoucherDto) {
    try {
      const response = await this.voucherService.create(data);

      return new ResponseContentModel(201, 'Tạo voucher thành công', response);
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }

  @Put('/:voucherId')
  @UseGuards(AuthGuard)
  async modify(
    @Param('voucherId') voucherId: string,
    @Body() data: UpdateVoucherDto,
  ) {
    try {
      const response = await this.voucherService.modify(voucherId, data);

      return new ResponseContentModel(200, 'Sửa voucher thành công', response);
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }

  @Delete('/:voucherId')
  @UseGuards(AuthGuard)
  async remove(@Param('voucherId') voucherId: string) {
    try {
      const response = await this.voucherService.remove(voucherId);

      return new ResponseContentModel(200, 'Xoá voucher thành công', response);
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }

  @Get()
  @UseGuards(AuthGuard)
  async list(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string,
  ) {
    try {
      const response = await this.voucherService.list(page, limit, search);

      return new ResponseContentModel(
        200,
        'Lấy danh sách voucher thành công',
        response,
      );
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }

  @Get('active')
  @UseGuards(AuthGuard)
  async findActiveVouchers() {
    try {
      const response = await this.voucherService.findActiveVouchers();

      return new ResponseContentModel(
        200,
        'lấy danh sách voucher thành công',
        response,
      );
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }

  @Get('/:voucherId')
  @UseGuards(AuthGuard)
  async detail(@Param('voucherId') voucherId: string) {
    try {
      const response = await this.voucherService.detail(voucherId);

      return new ResponseContentModel(
        200,
        'lấy chi tiết voucher thành công',
        response,
      );
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }
}
