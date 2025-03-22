import { PartialType } from '@nestjs/mapped-types';
import { IsNumber, IsString } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  productId: string;

  @IsString()
  orderId: string;

  @IsNumber()
  rating: number;

  @IsString()
  comment?: string;
}

export class UpdateReviewDto extends PartialType(CreateReviewDto) {}
