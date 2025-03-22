import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Voucher {
  @Prop({ required: true })
  code: string; // Mã voucher

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  discount: number; // Số tiền hoặc % giảm giá

  @Prop({ required: true, default: 1 })
  quantity: number; // Số lượng voucher còn lại

  @Prop({ default: false })
  isPercentage: boolean; // Giảm theo % hay theo số tiền cố định, 1 false: giảm theo số tiền, 2 true là giảm theo %

  @Prop({ required: true })
  minOrderValue: number; // Giá trị đơn hàng tối thiểu

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  expiryDate?: Date;
}

export const VoucherSchema = SchemaFactory.createForClass(Voucher);
export type VoucherDocument = Voucher & Document;
