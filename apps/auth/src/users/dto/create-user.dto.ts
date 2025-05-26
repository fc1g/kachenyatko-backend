import { AUTH_PROVIDER } from '@app/common';
import { IsEmail, IsEnum, IsOptional, IsStrongPassword } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsEnum(AUTH_PROVIDER)
  provider: AUTH_PROVIDER | null;

  @IsOptional()
  @IsStrongPassword()
  password: string | null;
}
