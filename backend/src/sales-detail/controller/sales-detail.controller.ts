import { Controller, Get, Param, Delete, ParseIntPipe } from '@nestjs/common';

import { SalesDetailService } from '../service/sales-detail.service';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/shared/enums';

@Controller('sales-detail')
export class SalesDetailController {
  constructor(private readonly salesDetailService: SalesDetailService) {}

  @Get()
  findAll() {
    return this.salesDetailService.findAll();
  }

  @Get('sale/:saleId')
  findBySale(@Param('saleId', ParseIntPipe) saleId: number) {
    return this.salesDetailService.findBySale(saleId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.salesDetailService.findOne(id);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.salesDetailService.remove(id);
  }
}
