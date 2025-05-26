import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { ROLE_NAME, RoleDto, Roles, RolesGuard, Serialize } from '@app/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CreateRoleDto } from './dto/create-role.dto';
import { RolesService } from './roles.service';

@Serialize(RoleDto)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE_NAME.ADMIN, ROLE_NAME.MODERATOR)
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE_NAME.ADMIN, ROLE_NAME.MODERATOR)
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE_NAME.ADMIN, ROLE_NAME.MODERATOR)
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
