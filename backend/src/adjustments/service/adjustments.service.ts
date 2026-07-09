import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAdjustmentDto, QueryParamsAdjustments } from '../dto';
import { ADJUSTMENTS_REPOSITORY } from '../repository/adjustments.repository.interface';
import type { IAdjustmentsRepository } from '../repository/adjustments.repository.interface';
import { Adjustment } from '../entities/adjustment.entity';
import { ProductsService } from 'src/products/service/products.service';
import { PaginatedResult } from 'src/shared/pagination/pagination.type';
import { DataSource } from 'typeorm';
import { Product } from 'src/products';

@Injectable()
export class AdjustmentsService {
  constructor(
    @Inject(ADJUSTMENTS_REPOSITORY)
    private readonly adjustmentsRepository: IAdjustmentsRepository,
    private readonly productsService: ProductsService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(
    params: QueryParamsAdjustments,
  ): Promise<PaginatedResult<Adjustment>> {
    const { page, limit, order, productId } = params;
    return this.adjustmentsRepository.findAll(page, limit, order, productId);
  }

  async findOne(id: number): Promise<Adjustment> {
    const adjustment = await this.adjustmentsRepository.finById(id);
    if (!adjustment) throw new NotFoundException('Adjustment not found');
    return adjustment;
  }

  async create(
    productId: number,
    createAdjustmentDto: CreateAdjustmentDto,
  ): Promise<Adjustment> {
    return this.dataSource.transaction(async (manager) => {
      const adjustmentRepo = manager.getRepository(Adjustment);

      await this.productsService.decreaseStock(
        productId,
        createAdjustmentDto.stockChange,
        manager,
      );

      const adjustment = await adjustmentRepo.save(
        adjustmentRepo.create({
          stockChange: createAdjustmentDto.stockChange,
          adjustmentType: createAdjustmentDto.adjustmentType,
          product: { id: productId } as Product,
        }),
      );
      return adjustment;
    });
  }

  /*  async update(id: number, updateAdjustmentDto: UpdateAdjustmentDto) {
    const adjustment = await this.findOne(id);

    if (updateAdjustmentDto.stockChange !== undefined) adjustment.stockChange = updateAdjustmentDto.stockChange;
    if (updateAdjustmentDto.adjustmentType !== undefined) adjustment.adjustmentType = updateAdjustmentDto.adjustmentType;

    return this.adjustmentsRepository.update(adjustment);
  }  Para mi un ajuste una ves hecho no se tendria que poder cambiar
*/

  async remove(id: number): Promise<Adjustment> {
    const adjustment = await this.findOne(id);
    await this.productsService.increaseStock(
      adjustment.product.id,
      adjustment.stockChange,
    );
    return this.adjustmentsRepository.remove(adjustment);
  }
}
