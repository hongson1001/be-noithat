import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class CartItem {
  @Prop()
  productId: string;

  @Prop({ required: true })
  quantity: number;
}

@Schema({ timestamps: true })
export class Cart {
  @Prop()
  userId: string;

  @Prop({ type: [CartItem], default: [] })
  items: CartItem[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);
export type CartDocument = Cart & Document;
