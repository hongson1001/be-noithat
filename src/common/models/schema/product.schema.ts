import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Product {
  @Prop({ type: [String], default: [] })
  categories: string[];

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  quantity: number;

  @Prop({ default: 0 })
  sold: number;

  @Prop()
  sku: string; //Mã sản phẩm

  @Prop()
  size: string; //Kích thước sản phẩm

  @Prop()
  material: string; //Vật liệu sản phẩm

  @Prop()
  description?: string;

  @Prop({ default: 'active' })
  status: string;

  @Prop()
  warranty?: string; //Thông tin bảo hành

  @Prop()
  shippingInfo?: string; //Thông tin vận chuyển

  @Prop({ type: [String], default: [] })
  images: string[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);

export type ProductDocument = Product & Document;
