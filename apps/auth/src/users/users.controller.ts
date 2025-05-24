import {
  CurrentUser,
  RoleName,
  Roles,
  Serialize,
  User,
  UserDto,
} from '@app/common';
import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UpdateUserRolesDto } from './dto/update-user-roles.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Serialize(UserDto)
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch(':id')
  updateUser(@CurrentUser() user: User, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(user.id, updateUserDto);
  }

  @Roles(RoleName.ADMIN, RoleName.MODERATOR)
  @Patch(':id/roles')
  updateUserRoles(
    @CurrentUser() user: User,
    @Body() updateUserRolesDto: UpdateUserRolesDto,
  ) {
    return this.usersService.updateRoles(user.id, updateUserRolesDto);
  }

  @Delete(':id')
  deleteUser(@CurrentUser() user: User) {
    return this.usersService.remove(user.id);
  }

  @Get()
  getUser(@CurrentUser() user: User) {
    return user;
  }
}
