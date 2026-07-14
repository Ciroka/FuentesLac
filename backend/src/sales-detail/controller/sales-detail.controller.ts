import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { SalesDetailService } from '../service/sales-detail.service';
import { CreateSalesDetailDto, UpdateSalesDetailDto } from '../dto';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/shared/enums';

@Controller('sales-detail')
export class SalesDetailController {
  constructor(private readonly salesDetailService: SalesDetailService) {}

  @Get()
  findAll() {
    return this.salesDetailService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesDetailService.findOne(+id);
  }

  @Post()
  create(@Body() createSalesDetailDto: CreateSalesDetailDto) {
    return this.salesDetailService.create(createSalesDetailDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSalesDetailDto: UpdateSalesDetailDto,
  ) {
    return this.salesDetailService.update(+id, updateSalesDetailDto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salesDetailService.remove(+id);
  }
}
