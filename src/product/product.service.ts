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

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private readonly proModel: Model<ProductDocument>,
  ) {}

  private addImagePrefix(img: string): string {
    if (img.startsWith('data.image')) return img;
    const mimeType =
      img.charAt(0) === '/' ? 'jpeg' : img.charAt(0) === 'i' ? 'png' : 'jpg';
    return `data:image/${mimeType};base64,${img}`;
  }

  async create(data: CreateProductDto): Promise<Product> {
    if (data.images) {
      data.images = data.images.map((img) => this.addImagePrefix(img));
    }
    const product = new this.proModel(data);
    await product.save();
    return product;
  }

  async modify(productId: string, data: UpdateProductDto): Promise<Product> {
    if (data.images) {
      data.images = data.images.map((img) => this.addImagePrefix(img));
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
    const product = await this.proModel.findById(productId).exec();
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
    if (search) {
      filter['$or'] = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }
    if (categories) {
      filter['categories'] = categories;
    }

    const [data, totalItems] = await Promise.all([
      this.proModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .select('categories name price sku size status images')
        .exec(),
      this.proModel.countDocuments(filter).exec(),
    ]);
    const dataWithStatus = data.map((p) => ({
      ...p.toObject(),
      statusLabel: genStatusLabel(p.status),
    }));

    return new PaginationSet(totalItems, page, limit, dataWithStatus);
  }
}
