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

import { SuppliesService } from '../service/supplies.service';
import {
  CreateSupplyDto,
  UpdateSupplyDto,
  QueryParamsSupplies,
  SupplyResponse,
} from '../dto';
import { PaginatedResult } from 'src/shared/pagination/pagination.type';
import { Supply } from '../entities/supply.entity';

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
  findOne(@Param('id') id: string): Promise<SupplyResponse> {
    return this.suppliesService.findOne(+id);
  }

  @Post()
  create(@Body() createSupplyDto: CreateSupplyDto): Promise<SupplyResponse> {
    return this.suppliesService.create(createSupplyDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSupplyDto: UpdateSupplyDto,
  ): Promise<SupplyResponse> {
    return this.suppliesService.update(+id, updateSupplyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<SupplyResponse> {
    return this.suppliesService.remove(+id);
  }
}
