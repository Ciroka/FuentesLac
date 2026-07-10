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

import { SalesService } from '../service/sales.service';
import {
  CreateSaleDto,
  UpdateSaleDto,
  QueryParamsSales,
  SaleResponse,
} from '../dto';
import { PaginatedResult } from 'src/shared/pagination/pagination.type';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  findAll(
    @Query() params: QueryParamsSales,
  ): Promise<PaginatedResult<SaleResponse>> {
    return this.salesService.findAll(params);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<SaleResponse> {
    return this.salesService.findOne(+id);
  }

  @Post()
  create(@Body() createSaleDto: CreateSaleDto): Promise<SaleResponse> {
    return this.salesService.create(createSaleDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSaleDto: UpdateSaleDto) {
    return this.salesService.update(+id, updateSaleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<SaleResponse> {
    return this.salesService.remove(+id);
  }
}
