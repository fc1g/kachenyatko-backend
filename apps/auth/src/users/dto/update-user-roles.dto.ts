import { RoleName } from '@app/common';
import { ArrayNotEmpty, IsEnum } from 'class-validator';

export class UpdateUserRolesDto {
  @ArrayNotEmpty()
  @IsEnum(RoleName, { each: true })
  roleNames: RoleName[];
}
