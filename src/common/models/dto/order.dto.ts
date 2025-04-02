import {
  IsString,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderItemDto } from './order-item.dto';

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @IsString()
  voucherId?: string;

  @IsNotEmpty()
  @IsString()
  shippingAddress: string;

  @IsEnum(['COD', 'bank_transfer'])
  @IsNotEmpty()
  paymentMethod: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(['pending', 'shipping', 'completed', 'cancelled'])
  @IsNotEmpty()
  status: string;
}
