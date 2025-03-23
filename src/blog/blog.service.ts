import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../common/models/schema/blog.schema';
import { Model } from 'mongoose';
import { CreateBlogDto, UpdateBlogDto } from '../common/models/dto/blog.dto';
import { PaginationSet } from '../common/models/response';

@Injectable()
export class BlogService {
  constructor(
    @InjectModel(Blog.name)
    private blogModel: Model<BlogDocument>,
  ) {}

  async create(data: CreateBlogDto): Promise<Blog> {
    const blog = new this.blogModel(data);
    await blog.save();

    return blog;
  }

  async modify(blogId: string, data: UpdateBlogDto): Promise<Blog> {
    const updatedBlog = await this.blogModel.findByIdAndUpdate(blogId, data, {
      new: true,
    });
    if (!updatedBlog) throw new NotFoundException('Không tìm thấy blog');
    return updatedBlog;
  }

  async remove(blogId: string): Promise<any> {
    const result = await this.blogModel.findByIdAndDelete(blogId);
    if (!result) throw new NotFoundException('Không tìm thấy blog');
    return { message: 'Xóa blog thành công' };
  }

  async list(page: number, limit: number): Promise<PaginationSet<Blog>> {
    const skip = (page - 1) * limit;
    const [data, totalItems] = await Promise.all([
      this.blogModel.find().skip(skip).limit(limit).exec(),
      this.blogModel.countDocuments().exec(),
    ]);

    return new PaginationSet(totalItems, page, limit, data);
  }

  async detail(blogId: string): Promise<Blog> {
    const blog = await this.blogModel.findById(blogId);
    if (!blog) throw new NotFoundException('Blog không tồn tại');
    return blog;
  }
}
