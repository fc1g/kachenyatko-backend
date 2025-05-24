import { RoleName } from '@app/common';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty()
  @IsEnum(RoleName)
  name: RoleName;
}
