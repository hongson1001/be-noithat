import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class CreateProductDto {
  @IsArray()
  @IsString({ each: true })
  categories: string[];

  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  material?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsOptional()
  @IsString()
  warranty?: string;

  @IsOptional()
  @IsString()
  shippingInfo?: string;

  @IsArray()
  @IsString({ each: true })
  images: string[];
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}
