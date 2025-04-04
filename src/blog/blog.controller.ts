import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import {
  ErrorResponseModel,
  ResponseContentModel,
} from '../common/models/response';
import { CreateBlogDto, UpdateBlogDto } from '../common/models/dto/blog.dto';
import { AuthGuard } from '../common/middleware/auth.middleware';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createBlog(@Body() data: CreateBlogDto) {
    try {
      const response = await this.blogService.create(data);
      return new ResponseContentModel(201, 'Tạo blog thành công', response);
    } catch (error) {
      return new ErrorResponseModel(500, 'Lỗi tạo blog', [
        error.message || 'Unknown error occurred',
      ]);
    }
  }

  @Get()
  // @UseGuards(AuthGuard)
  async getBlogs(@Query('page') page = 1, @Query('limit') limit = 10) {
    try {
      const response = await this.blogService.list(page, limit);
      return new ResponseContentModel(
        200,
        'Lấy danh sách blog thành công',
        response,
      );
    } catch (error) {
      return new ErrorResponseModel(500, 'Lỗi lấy danh sách blog', [
        error.message || 'Unknown error occurred',
      ]);
    }
  }

  @Get(':blogId')
  // @UseGuards(AuthGuard)
  async getBlogById(@Param('blogId') blogId: string) {
    try {
      const response = await this.blogService.detail(blogId);
      return new ResponseContentModel(
        200,
        'Lấy chi tiết blog thành công',
        response,
      );
    } catch (error) {
      return new ErrorResponseModel(500, 'Lỗi lấy chi tiết blog', [
        error.message || 'Unknown error occurred',
      ]);
    }
  }

  @Patch(':blogId')
  @UseGuards(AuthGuard)
  async updateBlog(
    @Param('blogId') blogId: string,
    @Body() data: UpdateBlogDto,
  ) {
    try {
      const response = await this.blogService.modify(blogId, data);
      return new ResponseContentModel(
        200,
        'Cập nhật blog thành công',
        response,
      );
    } catch (error) {
      return new ErrorResponseModel(500, 'Lỗi cập nhật blog', [
        error.message || 'Unknown error occurred',
      ]);
    }
  }

  @Delete(':blogId')
  @UseGuards(AuthGuard)
  async deleteBlog(@Param('blogId') blogId: string) {
    try {
      const response = await this.blogService.remove(blogId);
      return new ResponseContentModel(200, 'Xóa blog thành công', response);
    } catch (error) {
      return new ErrorResponseModel(500, 'Lỗi xóa blog', [
        error.message || 'Unknown error occurred',
      ]);
    }
  }
}
