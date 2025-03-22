import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { UserAuthGuard } from '../common/middleware/user.middleware';
import { CreateOrderDto } from '../common/models/dto/order.dto';
import {
  ErrorResponseModel,
  ResponseContentModel,
} from '../common/models/response';
import { AdminAuthGuard } from '../common/middleware/admin.middleware';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(UserAuthGuard)
  async createOrder(@Request() req: any, @Body() data: CreateOrderDto) {
    try {
      const userId = req.user?.sub;

      const response = await this.orderService.createOrder(userId, data);

      return new ResponseContentModel(201, 'Tạo đơn hàng thành công', response);
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }

  @Patch('/:orderId/status')
  @UseGuards(AdminAuthGuard)
  async updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body('status') status: string,
  ) {
    try {
      const response = await this.orderService.updateOrderStatus(
        orderId,
        status,
      );

      return new ResponseContentModel(
        200,
        'Cập nhâp trạng thái thành công',
        response,
      );
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }

  @Put('/:orderId/cancel')
  @UseGuards(UserAuthGuard || AdminAuthGuard)
  async cancelOrder(@Request() req: any, @Param('orderId') orderId: string) {
    try {
      const userId = req.user?.sub;
      const response = await this.orderService.cancelOrder(userId, orderId);

      return new ResponseContentModel(
        200,
        'Huỷ  dơn hàng thành công',
        response,
      );
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }

  @Get()
  @UseGuards(UserAuthGuard)
  async getUserOrders(
    @Request() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    try {
      const userId = req.user?.sub;
      const response = await this.orderService.getUserOrders(
        userId,
        page,
        limit,
      );

      return new ResponseContentModel(
        200,
        'Lấy danh sách dơn hàng thành công',
        response,
      );
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }

  @Get('admin')
  @UseGuards(AdminAuthGuard)
  async listOrders(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    try {
      const response = await this.orderService.listOrrder(page, limit);

      return new ResponseContentModel(
        200,
        'Lấy danh sách dơn hàng thành công',
        response,
      );
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }

  @Get('/:orderId')
  @UseGuards(UserAuthGuard)
  async detail(@Param('orderId') orderId: string) {
    try {
      const response = await this.orderService.detail(orderId);

      return new ResponseContentModel(
        200,
        'Lấy chi tiết dơn hàng thành công',
        response,
      );
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }
}
