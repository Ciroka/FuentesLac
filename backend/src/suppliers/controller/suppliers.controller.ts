import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';

import { SuppliersService } from '../service/suppliers.service';
import {
  CreateSupplierDto,
  UpdateSupplierDto,
  QueryParamsSuppliers,
  SupplierResponse,
} from '../dto';
import { PaginatedResult } from 'src/shared/pagination/pagination.type';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/shared/enums';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  findAll(
    @Query() params: QueryParamsSuppliers,
  ): Promise<PaginatedResult<SupplierResponse>> {
    return this.suppliersService.findAll(params);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<SupplierResponse> {
    return this.suppliersService.findOne(id);
  }

  @Post()
  create(
    @Body() createSupplierDto: CreateSupplierDto,
  ): Promise<SupplierResponse> {
    return this.suppliersService.create(createSupplierDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ): Promise<SupplierResponse> {
    return this.suppliersService.update(id, updateSupplierDto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<SupplierResponse> {
    return this.suppliersService.remove(id);
  }
}
