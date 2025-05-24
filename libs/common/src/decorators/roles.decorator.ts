import { RoleName } from '@app/common';
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: RoleName[]) => SetMetadata('roles', roles);
