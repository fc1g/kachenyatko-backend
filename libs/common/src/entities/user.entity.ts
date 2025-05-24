import { AbstractEntity, AuthProvider, Role } from '@app/common';
import { Column, Entity, Index, JoinTable, ManyToMany } from 'typeorm';

@Entity('users')
@Index(['email'], { unique: true })
export class User extends AbstractEntity<User> {
  @Column('varchar', { length: 100, unique: true })
  email: string;

  @Column('enum', { enum: AuthProvider, nullable: true })
  provider: AuthProvider | null;

  @Column('varchar', { length: 100, nullable: true })
  password: string | null;

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];
}
