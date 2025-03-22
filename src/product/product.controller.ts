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
import { AdminAuthGuard } from '../common/middleware/admin.middleware';
import {
  CreateProductDto,
  UpdateProductDto,
} from '../common/models/dto/product.dto';
import {
  ErrorResponseModel,
  ResponseContentModel,
} from '../common/models/response';
import { UserAuthGuard } from '../common/middleware/user.middleware';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(AdminAuthGuard)
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
  @UseGuards(AdminAuthGuard)
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
  @UseGuards(AdminAuthGuard)
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

  @Get('/:productId')
  @UseGuards(AdminAuthGuard || UserAuthGuard)
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

  @Get()
  @UseGuards(AdminAuthGuard || UserAuthGuard)
  async list(
    @Query('page') page: number = 10,
    @Query('limit') limit: number = 1,
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
}
