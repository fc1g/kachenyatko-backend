import { Column, Entity, Index, JoinTable, ManyToMany } from 'typeorm';
import { AUTH_PROVIDER } from '../constants';
import { AbstractEntity } from '../database';
import { Role } from './role.entity';

@Entity('users')
@Index(['email'], { unique: true })
export class User extends AbstractEntity<User> {
  @Column('varchar', { length: 100, unique: true })
  email: string;

  @Column('enum', { enum: AUTH_PROVIDER, nullable: true })
  provider: AUTH_PROVIDER | null;

  @Column('varchar', { length: 100, nullable: true })
  password: string | null;

  @Column('varchar', { nullable: true })
  hashedRefreshToken: string | null;

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];
}
