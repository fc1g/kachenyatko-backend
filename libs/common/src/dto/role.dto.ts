import { RoleName } from '@app/common';
import { Expose } from 'class-transformer';

export class RoleDto {
  @Expose()
  id: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  name: RoleName;
}
