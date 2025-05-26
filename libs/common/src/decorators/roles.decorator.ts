import { SetMetadata } from '@nestjs/common';
import { ROLE_KEY, ROLE_NAME } from '../constants';

export const Roles = (...roles: ROLE_NAME[]) => SetMetadata(ROLE_KEY, roles);
