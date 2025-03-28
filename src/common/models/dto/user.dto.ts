import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsBoolean,
  IsDateString,
  IsNumber,
} from 'class-validator';

//Xử lý đăng ký tài khoản
export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class SendOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class VerifyOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class SetPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;
}

export class OtpStatusDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsDateString()
  otpSentAt: string;

  @IsNumber()
  @IsNotEmpty()
  timeout: number;
}

//Đăng nhập tài khoản
export class LoginUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @IsBoolean()
  isResmember: boolean = false;
}

//Đổi mật khẩu
export class ChangePassworDto {
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  newPassword: string;
}

//Quên mật khẩu
export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  otp: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  newPassword: string;
}

//Xoá tài khoản
export class DeleteAccountDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ConfirmDeleteAccountDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}
