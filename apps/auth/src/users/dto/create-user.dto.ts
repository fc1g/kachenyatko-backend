import { AuthProvider } from '@app/common';
import { IsEmail, IsEnum, IsOptional, IsStrongPassword } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsEnum(AuthProvider)
  provider: AuthProvider | null;

  @IsOptional()
  @IsStrongPassword()
  password: string | null;
}
