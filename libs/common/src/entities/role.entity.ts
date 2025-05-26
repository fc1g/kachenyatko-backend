import { Column, Entity } from 'typeorm';
import { ROLE_NAME } from '../constants';
import { AbstractEntity } from '../database';

@Entity('roles')
export class Role extends AbstractEntity<Role> {
  @Column('enum', { enum: ROLE_NAME, unique: true })
  name: ROLE_NAME;
}
