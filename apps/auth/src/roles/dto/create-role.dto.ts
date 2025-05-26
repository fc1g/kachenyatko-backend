import { ROLE_NAME } from '@app/common';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty()
  @IsEnum(ROLE_NAME)
  name: ROLE_NAME;
}
