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
import { ProductService } from './product.service';
import {
  CreateProductDto,
  UpdateProductDto,
} from '../common/models/dto/product.dto';
import {
  ErrorResponseModel,
  ResponseContentModel,
} from '../common/models/response';
import { AuthGuard } from '../common/middleware/auth.middleware';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() data: CreateProductDto) {
    try {
      const response = await this.productService.create(data);

      return new ResponseContentModel(201, 'Tạo sản phẩm thành công', response);
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }

  @Put('/:productId')
  @UseGuards(AuthGuard)
  async modify(
    @Param('productId') productId: string,
    @Body() data: UpdateProductDto,
  ) {
    try {
      const response = await this.productService.modify(productId, data);

      return new ResponseContentModel(200, 'Sửa sản phẩm thành công', response);
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }

  @Delete('/:productId')
  @UseGuards(AuthGuard)
  async remove(@Param('productId') productId: string) {
    try {
      const response = await this.productService.remove(productId);

      return new ResponseContentModel(200, 'Xoá sản phẩm thành công', response);
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }

  @Get('best-sellers')
  async bestSellers(@Query('limit') limit: number = 10) {
    try {
      const response = await this.productService.bestSellers(limit);

      return new ResponseContentModel(
        200,
        'lấy danh sách sản phẩm thành công',
        response,
      );
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
    @Query('categories') categories: string,
    @Query('search') search: string,
  ) {
    try {
      const response = await this.productService.list(
        page,
        limit,
        categories,
        search,
      );

      return new ResponseContentModel(
        200,
        'lấy danh sách sản phẩm thành công',
        response,
      );
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }

  @Get('/:productId')
  @UseGuards(AuthGuard)
  async detail(@Param('productId') productId: string) {
    try {
      const response = await this.productService.detail(productId);

      return new ResponseContentModel(200, 'Sửa sản phẩm thành công', response);
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }
}
