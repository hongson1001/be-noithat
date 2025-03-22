import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Review {
  @Prop()
  productId: string;

  @Prop()
  userId: string;

  @Prop()
  reating: number;

  @Prop()
  commnet: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

export type ReviewDocument = Review & Document;
