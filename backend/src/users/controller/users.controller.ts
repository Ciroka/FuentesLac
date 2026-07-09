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
import {
  CreateUserDto,
  UpdateUserDto,
  QueryParamsUsers,
  UserResponse,
} from '../dto';
import { PaginatedResult } from 'src/shared/pagination/pagination.type';
import { User } from '../entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query() params: QueryParamsUsers): Promise<PaginatedResult<User>> {
    return this.usersService.findAll(params);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<UserResponse> {
    return this.usersService.findOne(+id);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<UserResponse> {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponse> {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<UserResponse> {
    return this.usersService.remove(+id);
  }
}
