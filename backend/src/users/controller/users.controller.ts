import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
} from '@nestjs/common';

import { UsersService } from '../service/users.service';
import { QueryParamsUsers, UserResponse, UpdateUserRoleDto } from '../dto';
import { PaginatedResult } from 'src/shared/pagination/pagination.type';
import { User } from '../entities/user.entity';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/shared/enums';
import type { AuthenticatedRequest } from 'src/auth/dto/request/user-request.dto';

@Controller('users')
@Roles(UserRole.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query() params: QueryParamsUsers): Promise<PaginatedResult<User>> {
    return this.usersService.findAll(params);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<UserResponse> {
    return this.usersService.findOneById(id);
  }

  @Patch(':id/role')
  updateRole(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
  ): Promise<User> {
    return this.usersService.updateRole(req.user.sub, id, dto);
  }

  @Delete(':id')
  remove(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<UserResponse> {
    return this.usersService.remove(req.user.sub, id);
  }
}
