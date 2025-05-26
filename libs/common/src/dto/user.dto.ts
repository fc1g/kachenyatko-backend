import { Expose, Type } from 'class-transformer';
import { AUTH_PROVIDER } from '../constants';
import { RoleDto } from './role.dto';

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
  provider: AUTH_PROVIDER | null;

  @Expose()
  @Type(() => RoleDto)
  roles: RoleDto[];
}
