import { Type } from 'class-transformer';
import { IsNumber, IsString, ValidateNested } from 'class-validator';

export class CartItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  quantity: number;
}

export class AddToCartDto {
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];
}

export class UpdateCartItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  quantity: number;
}

export class RemoveCartDto {
  @IsString()
  productId: string;
}

export class ClearCartDto {
  @IsString()
  userId: string;
}
