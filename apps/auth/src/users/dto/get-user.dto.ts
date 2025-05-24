import { User } from '@app/common';
import { FindOptionsWhere } from 'typeorm';

export class GetUserDto implements FindOptionsWhere<User> {}
