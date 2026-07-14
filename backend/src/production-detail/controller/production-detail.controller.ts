import { Controller, Get, Param, Delete } from '@nestjs/common';

import { ProductionDetailService } from '../service/production-detail.service';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/shared/enums';

@Controller('production-detail')
export class ProductionDetailController {
  constructor(
    private readonly productionDetailService: ProductionDetailService,
  ) {}

  @Get()
  findAll() {
    return this.productionDetailService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productionDetailService.findOne(+id);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const detail = await this.productionDetailService.findOne(+id);
    return this.productionDetailService.remove(detail);
  }
}
