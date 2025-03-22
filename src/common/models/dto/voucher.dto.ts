import { PartialType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateVoucherDto {
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  discount: number;

  @IsBoolean()
  @IsOptional()
  isPercentage: boolean = false;

  @IsNumber()
  @Min(0)
  minOrderValue: number;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;
}

export class UpdateVoucherDto extends PartialType(CreateVoucherDto) {}
