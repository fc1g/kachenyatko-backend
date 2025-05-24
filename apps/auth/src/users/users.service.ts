import { RoleName, User } from '@app/common';
import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { plainToClass } from 'class-transformer';
import { RolesService } from '../roles/roles.service';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUserDto } from './dto/get-user.dto';
import { UpdateUserRolesDto } from './dto/update-user-roles.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly repo: UsersRepository,
    private readonly rolesService: RolesService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    await this.validateCreateUserDto(createUserDto);
    const userRole = await this.rolesService.validateRole(RoleName.USER);
    const hashedPassword = createUserDto.provider
      ? null
      : await bcrypt.hash(createUserDto.password!, 10);
    const user = plainToClass(User, {
      ...createUserDto,
      password: hashedPassword,
      roles: [userRole],
    });
    return this.repo.create(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return this.repo.findOneAndUpdate({ id }, updateUserDto);
  }

  async updateRoles(id: string, updateUserRolesDto: UpdateUserRolesDto) {
    const roles = await Promise.all(
      updateUserRolesDto.roleNames.map((role) =>
        this.rolesService.validateRole(role),
      ),
    );
    return this.repo.findOneAndUpdate({ id }, { roles });
  }

  async remove(id: string) {
    return this.repo.findOneAndDelete({ id });
  }

  private async validateCreateUserDto(createUserDto: CreateUserDto) {
    try {
      await this.repo.findOne({ email: createUserDto.email });
    } catch (err) {
      console.error(err);
      return;
    }

    throw new UnprocessableEntityException('Email already exists');
  }

  async verifyUser(email: string, password: string) {
    const user = await this.getUser({ email });
    const isPasswordValid = await bcrypt.compare(password, user.password!);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credentials are not valid');
    }

    return user;
  }

  async getUser(getUserDto: GetUserDto) {
    return this.repo.findOne(getUserDto, 'User not found', {
      relations: {
        roles: true,
      },
    });
  }
}
