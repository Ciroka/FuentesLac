import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  CreateSuppliesXproductionDetailDto,
  UpdateSuppliesXproductionDetailDto,
} from '../dto';
import { SUPPLIES_XPRODUCTION_DETAIL_REPOSITORY } from '../repository/supplies-xproduction-detail.repository.interface';
import type { ISuppliesXproductionDetailRepository } from '../repository/supplies-xproduction-detail.repository.interface';
import { SuppliesXproductionDetail } from '../entities/supplies-xproduction-detail.entity';
import { Supply } from 'src/supplies';
import { ProductionDetail } from 'src/production-detail';

@Injectable()
export class SuppliesXproductionDetailService {
  constructor(
    @Inject(SUPPLIES_XPRODUCTION_DETAIL_REPOSITORY)
    private readonly detailRepository: ISuppliesXproductionDetailRepository,
  ) {}

  async findAll(): Promise<SuppliesXproductionDetail[]> {
    return this.detailRepository.findAll();
  }

  async findOne(id: number): Promise<SuppliesXproductionDetail> {
    const detail = await this.detailRepository.findOneById(id);
    if (!detail)
      throw new NotFoundException('SuppliesXproductionDetail not found');
    return detail;
  }

  async create(
    createDto: CreateSuppliesXproductionDetailDto,
  ): Promise<SuppliesXproductionDetail> {
    return this.detailRepository.create({
      quantity: createDto.quantity,
      supply: { id: createDto.supplyId } as Supply,
      productionDetail: {
        id: createDto.productionDetailId,
      } as ProductionDetail,
    });
  }

  async update(
    id: number,
    updateDto: UpdateSuppliesXproductionDetailDto,
  ): Promise<SuppliesXproductionDetail> {
    const detail = await this.findOne(id);
    if (updateDto.quantity !== undefined) detail.quantity = updateDto.quantity;
    if (updateDto.supplyId !== undefined)
      detail.supply = { id: updateDto.supplyId } as Supply;
    if (updateDto.productionDetailId !== undefined)
      detail.productionDetail = {
        id: updateDto.productionDetailId,
      } as ProductionDetail;
    return this.detailRepository.update(detail);
  }

  async remove(id: number): Promise<SuppliesXproductionDetail> {
    const detail = await this.findOne(id);
    return this.detailRepository.remove(detail);
  }
}
