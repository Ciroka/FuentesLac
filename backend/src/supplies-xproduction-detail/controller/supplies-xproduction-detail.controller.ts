import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';

import { SuppliesXproductionDetailService } from '../service/supplies-xproduction-detail.service';
import {
  CreateSuppliesXproductionDetailDto,
  UpdateSuppliesXproductionDetailDto,
} from '../dto';
import { SuppliesXproductionDetail } from '../entities/supplies-xproduction-detail.entity';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/shared/enums';

@Controller('supplies-xproduction-detail')
export class SuppliesXproductionDetailController {
  constructor(
    private readonly suppliesXproductionDetailService: SuppliesXproductionDetailService,
  ) {}

  @Get()
  findAll(): Promise<SuppliesXproductionDetail[]> {
    return this.suppliesXproductionDetailService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<SuppliesXproductionDetail> {
    return this.suppliesXproductionDetailService.findOne(id);
  }

  @Post()
  create(
    @Body()
    createSuppliesXproductionDetailDto: CreateSuppliesXproductionDetailDto,
  ): Promise<SuppliesXproductionDetail> {
    return this.suppliesXproductionDetailService.create(
      createSuppliesXproductionDetailDto,
    );
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    updateSuppliesXproductionDetailDto: UpdateSuppliesXproductionDetailDto,
  ): Promise<SuppliesXproductionDetail> {
    return this.suppliesXproductionDetailService.update(
      id,
      updateSuppliesXproductionDetailDto,
    );
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<SuppliesXproductionDetail> {
    return this.suppliesXproductionDetailService.remove(id);
  }
}
