import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../common/models/schema/blog.schema';
import { Model } from 'mongoose';
import { CreateBlogDto, UpdateBlogDto } from '../common/models/dto/blog.dto';
import { PaginationSet } from '../common/models/response';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';
import { genStatusLabel } from '../common/utils/status.util';

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
      .jpeg({ quality: 100 })
      .toFile(filePath);

    return `/uploads/${fileName}`;
  }

  async create(data: CreateBlogDto): Promise<Blog> {
    if (data.image && data.image.startsWith('data:image')) {
      console.log('Processing Base64 Image...');
      data.image = await this.saveImageLocally(data.image);
      console.log('Saved Image Path:', data.image);
    } else {
      console.log('No valid image provided.');
    }

    const blog = new this.blogModel(data);
    const savedBlog = await blog.save();

    console.log('Saved Blog:', savedBlog);
    return savedBlog;
  }

  async modify(blogId: string, data: UpdateBlogDto): Promise<Blog> {
    const blog = await this.blogModel.findById(blogId);
    if (!blog) throw new NotFoundException('Không tìm thấy blog');

    if (data.image && data.image.startsWith('data:image')) {
      console.log('Processing Base64 Image...');
      data.image = await this.saveImageLocally(data.image);
      console.log('Saved Image Path:', data.image);
    } else {
      console.log('No valid image provided.');
    }

    Object.assign(blog, data); // Cập nhật dữ liệu mới vào object
    const updatedBlog = await blog.save();

    console.log('Updated Blog:', updatedBlog);
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
      this.blogModel
        .find()
        .skip(skip)
        .limit(limit)
        .select('title content image status')
        .exec(),
      this.blogModel.countDocuments().exec(),
    ]);

    const dataWithImages = data.map((b) => ({
      ...b.toObject(),
      images: b.image ? [b.image] : [],
      statusLabel: genStatusLabel(b.status),
    }));

    return new PaginationSet(page, limit, totalItems, dataWithImages);
  }

  async detail(blogId: string): Promise<Blog> {
    const blog = await this.blogModel.findById(blogId);
    if (!blog) throw new NotFoundException('Blog không tồn tại');
    return blog;
  }
}
