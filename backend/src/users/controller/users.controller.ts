import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';

import { UsersService } from '../service/users.service';
import { QueryParamsUsers, UserResponse } from '../dto';
import { PaginatedResult } from 'src/shared/pagination/pagination.type';
import { User } from '../entities/user.entity';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/shared/enums';

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

  @Delete(':id')
  remove(@Param('id') id: string): Promise<UserResponse> {
    return this.usersService.remove(id);
  }
}
