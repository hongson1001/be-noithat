import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatisticalService } from './statistical.service';
import { AuthGuard } from '../common/middleware/auth.middleware';
import {
  ErrorResponseModel,
  ResponseContentModel,
} from '../common/models/response';

@Controller('statistical')
export class StatisticalController {
  constructor(private readonly statisticalService: StatisticalService) {}

  @Get('user-statistics')
  @UseGuards(AuthGuard)
  async getUserStatistics(
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    try {
      const response = await this.statisticalService.getUserStatistics(
        month,
        year,
      );

      return new ResponseContentModel(
        200,
        'Thống kê người dùng thành công',
        response,
      );
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }

  @Get('product-statistics')
  @UseGuards(AuthGuard)
  async getProductStatistics(
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    try {
      const response = await this.statisticalService.getProductStatistics(
        month,
        year,
      );

      return new ResponseContentModel(
        200,
        'Thống kê người dùng thành công',
        response,
      );
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }

  @Get('total-product-statistics')
  @UseGuards(AuthGuard)
  async getTotalProducts(
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    try {
      const response =
        await this.statisticalService.getTotalProductsByMonthYear(month, year);

      return new ResponseContentModel(
        200,
        'Thống kê người dùng thành công',
        response,
      );
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }

  @Get('status-order-statistics')
  @UseGuards(AuthGuard)
  async getOrderStatistics(
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    try {
      const response = await this.statisticalService.getOrderStatistics(
        month,
        year,
      );

      return new ResponseContentModel(
        200,
        'Thống kê người dùng thành công',
        response,
      );
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }

  @Get('revenue-statistics')
  @UseGuards(AuthGuard)
  async getRevenueStatistics(
    @Query('type') type: 'day' | 'week' | 'month',
    @Query('date') date: string,
  ) {
    try {
      const result = await this.statisticalService.getRevenueStatistics(
        type,
        date,
      );

      return new ResponseContentModel(
        200,
        'Thống kê doanh thu thành công',
        result,
      );
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        (error as Error).message || 'Unknown error occurred',
      ]);
    }
  }
}
