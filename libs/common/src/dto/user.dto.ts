import { AuthProvider, RoleDto } from '@app/common';
import { Expose, Type } from 'class-transformer';

export class UserDto {
  @Expose()
  id: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  email: string;

  @Expose()
  provider: AuthProvider | null;

  @Expose()
  @Type(() => RoleDto)
  roles: RoleDto[];
}
