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
import { CategoryService } from './category.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../common/models/dto/category.dto';
import {
  ErrorResponseModel,
  ResponseContentModel,
} from '../common/models/response';
import { Category } from '../common/models/schema/category.schema';
import { AuthGuard } from '../common/middleware/auth.middleware';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() data: CreateCategoryDto) {
    try {
      const response = await this.categoryService.create(data);

      return new ResponseContentModel<Category>(
        201,
        'Tạo danh mục thành công',
        response,
      );
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }

  @Put(':cateId')
  @UseGuards(AuthGuard)
  async modify(
    @Param('cateId') cateId: string,
    @Body() data: UpdateCategoryDto,
  ) {
    try {
      const response = await this.categoryService.modify(cateId, data);

      return new ResponseContentModel<Category>(
        200,
        'Sửa danh mục thành công',
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
  async list(@Query('search') search?: string) {
    try {
      const response = await this.categoryService.list(search);

      return new ResponseContentModel<Category[]>(
        200,
        'Sửa danh mục thành công',
        response,
      );
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }

  @Get(':cateId')
  @UseGuards(AuthGuard)
  async detail(@Param('cateId') cateId: string) {
    try {
      const response = await this.categoryService.detail(cateId);

      return new ResponseContentModel<Category>(
        200,
        'Sửa danh mục thành công',
        response,
      );
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }

  @Delete(':cateId')
  @UseGuards(AuthGuard)
  async remove(@Param('cateId') cateId: string) {
    try {
      const response = await this.categoryService.remove(cateId);

      return new ResponseContentModel<Category>(
        200,
        'Sửa danh mục thành công',
        response,
      );
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }

  @Get('parent/:parentId')
  async findByParentId(@Param('parentId') parentId: string) {
    try {
      const response = await this.categoryService.findByParentId(parentId);

      return new ResponseContentModel<Category[]>(
        200,
        'Lấy danh sách thành công',
        response,
      );
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }
}
