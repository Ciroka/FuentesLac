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

import { SuppliersService } from '../service/suppliers.service';
import {
  CreateSupplierDto,
  UpdateSupplierDto,
  QueryParamsSuppliers,
  SupplierResponse,
} from '../dto';
import { PaginatedResult } from 'src/shared/pagination/pagination.type';

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
  findOne(@Param('id') id: string): Promise<SupplierResponse> {
    return this.suppliersService.findOne(+id);
  }

  @Post()
  create(
    @Body() createSupplierDto: CreateSupplierDto,
  ): Promise<SupplierResponse> {
    return this.suppliersService.create(createSupplierDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ): Promise<SupplierResponse> {
    return this.suppliersService.update(+id, updateSupplierDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<SupplierResponse> {
    return this.suppliersService.remove(+id);
  }
}
