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

import { SuppliesService } from '../service/supplies.service';
import {
  CreateSupplyDto,
  UpdateSupplyDto,
  QueryParamsSupplies,
  SupplyResponse,
} from '../dto';
import { PaginatedResult } from 'src/shared/pagination/pagination.type';
import { Supply } from '../entities/supply.entity';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/shared/enums';

@Controller('supplies')
export class SuppliesController {
  constructor(private readonly suppliesService: SuppliesService) {}

  @Get()
  findAll(
    @Query() params: QueryParamsSupplies,
  ): Promise<PaginatedResult<Supply>> {
    return this.suppliesService.findAll(params);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<SupplyResponse> {
    return this.suppliesService.findOne(id);
  }
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() createSupplyDto: CreateSupplyDto): Promise<SupplyResponse> {
    return this.suppliesService.create(createSupplyDto);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSupplyDto: UpdateSupplyDto,
  ): Promise<SupplyResponse> {
    return this.suppliesService.update(id, updateSupplyDto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<SupplyResponse> {
    return this.suppliesService.remove(id);
  }
}
