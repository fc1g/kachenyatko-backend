import { formatNotFound, Role, RoleName } from '@app/common';
import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateRoleDto } from './dto/create-role.dto';
import { RolesRepository } from './roles.repository';

@Injectable()
export class RolesService {
  constructor(private readonly repo: RolesRepository) {}

  create(createRoleDto: CreateRoleDto) {
    const role = plainToClass(Role, { ...createRoleDto });
    return this.repo.create(role);
  }

  findAll() {
    return this.repo.findAll({});
  }

  findOne(id: string) {
    const errorMessage = formatNotFound('Role', 'id', id);
    return this.repo.findOne({ id }, errorMessage);
  }

  remove(id: string) {
    return this.repo.findOneAndDelete({ id });
  }

  async validateRole(name: RoleName) {
    try {
      const role = await this.repo.findOne({ name });
      return role;
    } catch (err) {
      console.error(err);
      const role = await this.create({ name });
      return role;
    }
  }
}
