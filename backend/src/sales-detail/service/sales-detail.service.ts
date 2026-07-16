import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import type { ISalesDetailRepository } from '../repository/sales-detail.repository.interface';
import { SALES_DETAIL_REPOSITORY } from '../repository/sales-detail.repository.interface';
import { SalesDetail } from '../entities/sales-detail.entity';

@Injectable()
export class SalesDetailService {
  constructor(
    @Inject(SALES_DETAIL_REPOSITORY)
    private readonly detailRepository: ISalesDetailRepository,
  ) {}

  async findAll() {
    return this.detailRepository.findAll();
  }

  async findOne(id: number): Promise<SalesDetail> {
    const detail = await this.detailRepository.findOneById(id);
    if (!detail) throw new NotFoundException('Sales detail not found');
    return detail;
  }

  async findBySale(saleId: number) {
    return this.detailRepository.findBySale(saleId);
  }

  async sumWeightByBatch(batchId: number): Promise<number> {
    return this.detailRepository.sumWeightByBatch(batchId);
  }

  // async create(
  //   createSalesDetailDto: CreateSalesDetailDto,
  // ): Promise<SalesDetail> {
  //   const batch = await this.batchService.findOne(
  //     createSalesDetailDto.batchId,
  //   );
  //   const subtotal =
  //     createSalesDetailDto.quantity * Number(batch.product.salePrice);
  //   return this.detailRepository.create({ ...createSalesDetailDto, subtotal });
  // }

  // async update(id: number, updateSalesDetailDto: UpdateSalesDetailDto) {
  //   const detail = await this.findOne(id);
  //   if (updateSalesDetailDto.quantity !== undefined) {
  //     detail.quantity = updateSalesDetailDto.quantity;
  //     detail.subtotal = detail.quantity * Number(detail.batch.product.salePrice);
  //   }
  //   return this.detailRepository.update(detail);
  // }

  async remove(id: number) {
    const detail = await this.findOne(id);
    return this.detailRepository.remove(detail);
  }
}
