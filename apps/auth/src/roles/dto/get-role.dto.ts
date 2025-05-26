import { Role } from '@app/common';
import { FindOptionsWhere } from 'typeorm';

export class GetRoleDto implements FindOptionsWhere<Role> {}
