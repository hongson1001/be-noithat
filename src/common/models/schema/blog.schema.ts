import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Blog {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop()
  image: string;

  @Prop({ default: 'active' })
  status: string;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

export type BlogDocument = Blog & Document;
