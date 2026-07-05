import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductionDetailService } from '../service/production-detail.service';
import { CreateProductionDetailDto } from '../dto/create-production-detail.dto';
import { UpdateProductionDetailDto } from '../dto/update-production-detail.dto';

@Controller('production-detail')
export class ProductionDetailController {
  constructor(private readonly productionDetailService: ProductionDetailService) {}

  @Post()
  create(@Body() createProductionDetailDto: CreateProductionDetailDto) {
    return this.productionDetailService.create(createProductionDetailDto);
  }

  @Get()
  findAll() {
    return this.productionDetailService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productionDetailService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductionDetailDto: UpdateProductionDetailDto) {
    return this.productionDetailService.update(+id, updateProductionDetailDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productionDetailService.remove(+id);
  }
}
