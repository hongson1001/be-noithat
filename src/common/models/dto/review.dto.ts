import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ProductReviewDto {
  @IsString()
  productId: string;

  @IsNumber()
  rating: number;

  @IsString()
  comment?: string;
}

export class CreateReviewDto {
  @IsString()
  orderId: string; // Đơn hàng cần đánh giá

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductReviewDto)
  reviews: ProductReviewDto[];
}
