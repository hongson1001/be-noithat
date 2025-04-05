import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Product,
  ProductDocument,
} from '../common/models/schema/product.schema';
import { Model } from 'mongoose';
import {
  CreateProductDto,
  UpdateProductDto,
} from '../common/models/dto/product.dto';
import { PaginationSet } from '../common/models/response';
import { genStatusLabel } from '../common/utils/status.util';
import * as fs from 'fs';
import * as path from 'path';
import {
  Category,
  CategoryDocument,
} from '../common/models/schema/category.schema';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private readonly proModel: Model<ProductDocument>,
    @InjectModel(Category.name)
    private readonly cateModel: Model<CategoryDocument>,
  ) {}

  private async saveImageLocally(base64: string): Promise<string> {
    if (!base64 || !base64.includes(',')) {
      throw new Error('Ảnh không hợp lệ hoặc không đúng định dạng base64');
    }

    const buffer = Buffer.from(base64.split(',')[1], 'base64');
    const fileName = `${Date.now()}.jpg`;
    const uploadPath = path.join(__dirname, '..', '..', 'public', 'uploads');

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const filePath = path.join(uploadPath, fileName);
    await fs.promises.writeFile(filePath, buffer);

    return `/uploads/${fileName}`;
  }

  async create(data: CreateProductDto): Promise<Product> {
    if (data.images) {
      const imagePaths = await Promise.all(
        data.images.map((img) => this.saveImageLocally(img)),
      );
      data.images = imagePaths;
    }
    const product = new this.proModel(data);
    await product.save();
    return product;
  }

  async modify(productId: string, data: UpdateProductDto): Promise<Product> {
    if (data.images && Array.isArray(data.images)) {
      const newBase64Images = data.images.filter(
        (img) => typeof img === 'string' && img.startsWith('data:image/'),
      );

      const existingImages = data.images.filter(
        (img) => typeof img === 'string' && !img.startsWith('data:image/'),
      );

      const uploadedImages = await Promise.all(
        newBase64Images.map((img) => this.saveImageLocally(img)),
      );

      data.images = [...existingImages, ...uploadedImages];
    }

    const product = await this.proModel
      .findByIdAndUpdate(productId, data, { new: true })
      .exec();

    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    return product;
  }

  async remove(productId: string): Promise<any> {
    const product = await this.proModel.findByIdAndDelete(productId).exec();
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }
    return 'Xoá sản phẩm thành công';
  }

  async detail(productId: string): Promise<Product> {
    const product = await this.proModel
      .findById(productId)
      .populate({
        path: 'categories',
        select: '_id name parentId',
      })
      .exec();
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }
    return product;
  }

  async list(
    page: number,
    limit: number,
    categories: string,
    search?: string,
  ): Promise<PaginationSet<Product>> {
    const skip = (page - 1) * limit;
    const filter: any = {};

    // Tìm kiếm theo tên hoặc mã sản phẩm (SKU)
    if (search) {
      filter['$or'] = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    if (categories) {
      const categoryArray = categories.split(',').map((id) => id.trim());

      if (categoryArray.length > 0) {
        filter['categories'] = { $in: categoryArray };
      }
    }

    const [data, totalItems] = await Promise.all([
      this.proModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .select('categories name price sku size status images sold')
        .exec(),
      this.proModel.countDocuments(filter).exec(),
    ]);

    const dataWithStatus = data.map((p) => ({
      ...p.toObject(),
      images: p.images?.length ? [p.images[0]] : [],
      statusLabel: genStatusLabel(p.status),
    }));

    return new PaginationSet(page, limit, totalItems, dataWithStatus);
  }

  async bestSellers(limit: number): Promise<Product[]> {
    const products = await this.proModel
      .find()
      .sort({ sold: -1 })
      .limit(limit)
      .select('categories name price sku size status images sold')
      .exec();

    return products;
  }
}
