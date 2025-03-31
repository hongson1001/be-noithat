import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Category,
  CategoryDocument,
} from '../common/models/schema/category.schema';
import { Model } from 'mongoose';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../common/models/dto/category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private readonly cateModel: Model<CategoryDocument>,
  ) {}

  async create(data: CreateCategoryDto): Promise<Category> {
    const category = new this.cateModel(data);
    await category.save();

    return category;
  }

  async modify(cateId: string, data: UpdateCategoryDto): Promise<Category> {
    const category = await this.cateModel.findById(cateId).exec();
    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    const updateCate = await this.cateModel.findByIdAndUpdate(cateId, data, {
      new: true,
    });
    if (!updateCate) {
      throw new NotFoundException(`Category with ID ${cateId} not found`);
    }
    return updateCate;
  }

  async list(search?: string): Promise<Category[]> {
    const filter = search
      ? {
          $or: [{ name: { $regex: new RegExp(search, 'i') } }],
        }
      : {};
    return this.cateModel.find(filter).exec();
  }

  async detail(cateId: string): Promise<Category> {
    const category = await this.cateModel.findById(cateId).exec();
    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    return category;
  }

  async remove(cateId: string): Promise<any> {
    const category = await this.cateModel.findByIdAndDelete(cateId).exec();
    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    return 'Xoá danh mục thành công';
  }

  async findByParentId(parentId: string): Promise<Category[]> {
    const categories = await this.cateModel.find({ parentId }).exec();

    return categories;
  }
}
