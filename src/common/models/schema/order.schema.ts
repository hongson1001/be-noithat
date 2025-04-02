import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { OrderItem } from './order-item.schema';

@Schema({ timestamps: true })
export class Order {
  @Prop()
  userId: string;

  @Prop({ required: true })
  items: OrderItem[];

  @Prop()
  voucherId?: string;

  @Prop({ required: true })
  totalPrice: number;

  @Prop({
    default: 'pending',
    enum: ['pending', 'shipping', 'completed', 'cancelled'],
  })
  status: string;

  @Prop()
  shippingAddress: string;

  @Prop({ enum: ['COD', 'bank_transfer'], default: 'COD' })
  paymentMethod: string;

  @Prop()
  note?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
export type OrderDocument = Order & Document;
