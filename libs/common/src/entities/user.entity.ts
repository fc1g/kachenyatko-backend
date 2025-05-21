import { AbstractEntity } from '@app/common';
import { Column, Entity, Index } from 'typeorm';

@Entity('users')
@Index(['email'], { unique: true })
export class User extends AbstractEntity<User> {
  @Column('varchar', { length: 100, unique: true })
  email: string;

  @Column('varchar', { length: 100 })
  password: string;
}
