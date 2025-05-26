import { ROLE_NAME, StatusResponseDto, User } from '@app/common';
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
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly repo: UsersRepository,
    private readonly rolesService: RolesService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    await this.validateCreateUserDto(createUserDto);
    const role = await this.rolesService.findOne({ name: ROLE_NAME.USER });

    const hashedPassword = await this.generatePassword(createUserDto);

    const user = plainToClass(User, {
      ...createUserDto,
      password: hashedPassword,
      roles: [role],
    });
    return this.repo.create(user);
  }

  private async validateCreateUserDto(
    createUserDto: CreateUserDto,
  ): Promise<void> {
    try {
      await this.getUser({ email: createUserDto.email });
    } catch (err) {
      console.error(err);
      return;
    }

    throw new UnprocessableEntityException('Email already exists');
  }

  private async generatePassword(
    createUserDto: CreateUserDto,
  ): Promise<string | null> {
    let hashedPassword: string | null;

    if (createUserDto.provider && !createUserDto.password) {
      hashedPassword = null;
    } else {
      hashedPassword = await bcrypt.hash(createUserDto.password!, 10);
    }

    return hashedPassword;
  }

  async verifyUser(email: string, password: string): Promise<User> {
    const user = await this.getUser({ email });

    if (user.provider) {
      throw new UnauthorizedException(
        `Credentials are not valid. Please login with your provider: ${user.provider}`,
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password!);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credentials are not valid');
    }

    return user;
  }

  async remove(id: string): Promise<StatusResponseDto> {
    try {
      await this.repo.findOneAndDelete({ id }, 'User');
      return { statusCode: 204, message: 'User deleted successfully' };
    } catch (err) {
      return {
        statusCode: 500,
        message: err instanceof Error ? err.message : 'Failed to delete user',
      };
    }
  }

  async getUser(getUserDto: GetUserDto): Promise<User> {
    return this.repo.findOne(getUserDto, 'User', {
      relations: {
        roles: true,
      },
    });
  }
}
