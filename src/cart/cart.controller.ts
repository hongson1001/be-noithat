import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from '../common/models/dto/cart.dto';
import {
  ErrorResponseModel,
  ResponseContentModel,
} from '../common/models/response';
import { AuthGuard } from '../common/middleware/auth.middleware';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add-to-cart')
  @UseGuards(AuthGuard)
  async addToCart(@Request() req: any, @Body() data: AddToCartDto) {
    try {
      const userId = req.user?.sub;

      const response = await this.cartService.addToCart(userId, data);

      return new ResponseContentModel(
        200,
        'Thêm sản phảm vào giỏ hàng thành công',
        response,
      );
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }

  @Get('my-cart')
  @UseGuards(AuthGuard)
  async myCart(@Request() req: any) {
    try {
      const userId = req.user?.sub;

      const response = await this.cartService.getCart(userId);

      return new ResponseContentModel(200, 'Lấy giỏ hàng thành công', response);
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }

  @Patch('update-cart')
  @UseGuards(AuthGuard)
  async updateCart(@Request() req: any, @Body() data: UpdateCartItemDto) {
    try {
      const userId = req.user?.sub;

      const response = await this.cartService.updateCartItem(userId, data);

      return new ResponseContentModel(
        200,
        'Cập nhập giỏ hàng thành công',
        response,
      );
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }

  @Delete('remove-product/:productId')
  @UseGuards(AuthGuard)
  async removeCartItem(
    @Request() req: any,
    @Param('productId') productId: string,
  ) {
    try {
      const userId = req.user?.sub;

      const response = await this.cartService.removeCartItem(userId, productId);

      return new ResponseContentModel(
        200,
        'Xoá sản phẩm giỏ hàng thành công',
        response,
      );
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }

  @Delete('clear-cart')
  @UseGuards(AuthGuard)
  async clearCart(@Request() req: any) {
    try {
      const userId = req.user?.sub;

      const response = await this.cartService.clearCart(userId);

      return new ResponseContentModel(
        200,
        'Làm trống giỏ hàng thành công',
        response,
      );
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }
}
