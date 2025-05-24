import { AbstractEntity, RoleName } from '@app/common';
import { Column, Entity } from 'typeorm';

@Entity('roles')
export class Role extends AbstractEntity<Role> {
  @Column('enum', { enum: RoleName, unique: true })
  name: RoleName;
}
