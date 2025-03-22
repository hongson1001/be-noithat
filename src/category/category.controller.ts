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
import { AdminAuthGuard } from '../common/middleware/admin.middleware';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../common/models/dto/category.dto';
import { UserAuthGuard } from '../common/middleware/user.middleware';
import {
  ErrorResponseModel,
  ResponseContentModel,
} from '../common/models/response';
import { Category } from '../common/models/schema/category.schema';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(AdminAuthGuard)
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
  @UseGuards(AdminAuthGuard)
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
  @UseGuards(UserAuthGuard)
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
  @UseGuards(AdminAuthGuard)
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
  @UseGuards(AdminAuthGuard)
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
}
