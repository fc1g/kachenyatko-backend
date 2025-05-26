import { Expose } from 'class-transformer';
import { ROLE_NAME } from '../constants';

export class RoleDto {
  @Expose()
  id: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  name: ROLE_NAME;
}
