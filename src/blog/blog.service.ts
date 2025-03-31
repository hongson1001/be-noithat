import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../common/models/schema/blog.schema';
import { Model } from 'mongoose';
import { CreateBlogDto, UpdateBlogDto } from '../common/models/dto/blog.dto';
import { PaginationSet } from '../common/models/response';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';

@Injectable()
export class BlogService {
  constructor(
    @InjectModel(Blog.name)
    private blogModel: Model<BlogDocument>,
  ) {}

  private async saveImageLocally(base64: string): Promise<string> {
    const buffer = Buffer.from(base64.split(',')[1], 'base64');
    const fileName = `${Date.now()}.jpg`;
    const uploadPath = path.join(__dirname, '..', '..', 'public', 'uploads');

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const filePath = path.join(uploadPath, fileName);

    await sharp(buffer)
      .resize(800, 600)
      .toFormat('jpeg')
      .jpeg({ quality: 80 })
      .toFile(filePath);

    return `/uploads/${fileName}`;
  }

  async create(data: CreateBlogDto): Promise<Blog> {
    if (data.image) {
      data.image = await this.saveImageLocally(data.image);
    }

    const blog = new this.blogModel(data);
    await blog.save();
    return blog;
  }

  async modify(blogId: string, data: UpdateBlogDto): Promise<Blog> {
    if (data.image) {
      data.image = await this.saveImageLocally(data.image);
    }

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
