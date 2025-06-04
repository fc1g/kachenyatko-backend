import { Role, StatusResponseDto } from '@app/common';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateRoleDto } from './dto/create-role.dto';
import { GetRoleDto } from './dto/get-role.dto';
import { RolesRepository } from './roles.repository';

@Injectable()
export class RolesService {
  constructor(private readonly repo: RolesRepository) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    await this.validateCreateRole(createRoleDto);
    const role = plainToClass(Role, { ...createRoleDto });
    return this.repo.create(role);
  }

  async findAll(): Promise<Role[]> {
    return this.repo.findAll({});
  }

  async findOne(where: GetRoleDto): Promise<Role> {
    return this.repo.findOne(where, 'Role');
  }

  async remove(id: string): Promise<StatusResponseDto> {
    try {
      await this.repo.findOneAndDelete({ id }, 'Role');
      return { statusCode: 204, message: 'Role deleted successfully' };
    } catch (err) {
      return {
        statusCode: 500,
        message: err instanceof Error ? err.message : 'Failed to delete role',
      };
    }
  }

  private async validateCreateRole(
    createRoleDto: CreateRoleDto,
  ): Promise<void> {
    try {
      await this.findOne({ name: createRoleDto.name });
    } catch (err) {
      console.error(err);
      return;
    }

    throw new UnprocessableEntityException('Role already exists');
  }
}
