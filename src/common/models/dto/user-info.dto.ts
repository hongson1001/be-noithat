import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsObject,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

// DTO cho địa chỉ
export class AddressDto {
  @IsString()
  @IsNotEmpty({ message: 'Địa chỉ chi tiết không được để trống.' })
  address: string;

  @IsObject()
  @IsOptional()
  province?: {
    code: string;
    name: string;
    type: string;
    typeName: string;
  };

  @IsObject()
  @IsOptional()
  district?: {
    code: string;
    name: string;
    type: string;
  };

  @IsObject()
  @IsOptional()
  ward?: {
    code: string;
    name: string;
    type: string;
  };

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean = false;
}

export class UpdateAddressDto {
  @IsArray({ message: 'Địa chỉ phải là một mảng các đối tượng.' })
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  address: AddressDto[];
}

// Định nghĩa DTO cho UserInformation
export class CreateUserInformationDto {
  @IsString()
  userId: string;

  @IsString()
  fullName: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  email: string;

  @IsString()
  birthday: string;

  @IsEnum(['male', 'female', 'other'])
  gender: string;

  @IsArray()
  @IsOptional()
  address: AddressDto[];

  @IsOptional()
  @IsString()
  avatar: string;

  @IsOptional()
  @IsString()
  status: string;
}

// DTO cho UpdateUserInformationDto (cho phép cập nhật thông tin)
export class UpdateUserInformationDto {
  @IsOptional()
  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  birthday: string;

  @IsOptional()
  @IsEnum(['male', 'female', 'other'])
  gender: string;

  @IsOptional()
  @IsArray()
  address: AddressDto[] = [];

  @IsOptional()
  @IsString()
  avatar: string;

  @IsOptional()
  @IsString()
  status: string;
}
