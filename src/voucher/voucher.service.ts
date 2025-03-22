import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Voucher,
  VoucherDocument,
} from '../common/models/schema/voucher.schema';
import { Model } from 'mongoose';
import {
  CreateVoucherDto,
  UpdateVoucherDto,
} from '../common/models/dto/voucher.dto';
import { PaginationSet } from '../common/models/response';

@Injectable()
export class VoucherService {
  constructor(
    @InjectModel(Voucher.name)
    private readonly voucherModel: Model<VoucherDocument>,
  ) {}

  async create(data: CreateVoucherDto): Promise<Voucher> {
    const voucher = new this.voucherModel(data);
    await voucher.save();

    return voucher;
  }

  async modify(voucherId: string, data: UpdateVoucherDto): Promise<Voucher> {
    const voucher = await this.voucherModel
      .findByIdAndUpdate(voucherId, data, { new: true })
      .exec();
    if (!voucher) {
      throw new NotFoundException('Không tìm thấy voucher');
    }

    return voucher;
  }

  async remove(voucherId: string): Promise<any> {
    const voucher = await this.voucherModel.findByIdAndDelete(voucherId).exec();
    if (!voucher) {
      throw new NotFoundException('Không tìm thấy voucher');
    }

    return 'Xoá voucher thành công';
  }

  async list(
    page: number,
    limit: number,
    search: string,
  ): Promise<PaginationSet<Voucher>> {
    const skip = (page - 1) * limit;
    const filter: Record<string, any> = {};

    if (search) {
      filter.$or = [{ name: { $regex: search, $options: 'i' } }];
    }

    const [data, totalItems] = await Promise.all([
      this.voucherModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .select(
          'code name discount quantity minOrderValue isPercentage expiryDate',
        )
        .exec(),
      this.voucherModel.countDocuments(filter).exec(),
    ]);

    return new PaginationSet(totalItems, page, limit, data);
  }

  async detail(voucherId: string): Promise<Voucher> {
    const voucher = await this.voucherModel.findById(voucherId).exec();
    if (!voucher) {
      throw new NotFoundException('Không tìm thấy voucher');
    }

    return voucher;
  }

  async findActiveVouchers(): Promise<Voucher[]> {
    const now = new Date();
    return this.voucherModel
      .find({
        isActive: true,
        $or: [
          { expiryDate: { $exists: false } },
          { expiryDate: { $gte: now } },
        ],
      })
      .select(
        'code name discount quantity minOrderValue isPercentage expiryDate',
      )
      .exec();
  }
}
