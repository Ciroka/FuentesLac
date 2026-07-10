import { EntityManager } from 'typeorm';
import { ProductionDetail } from '../entities/production-detail.entity';

export const PRODUCTION_DETAIL_REPOSITORY = 'PRODUCTION_DETAIL_REPOSITORY';

export interface ProductionDetailRepository {
  findAll(): Promise<ProductionDetail[]>;
  findByProduction(productionId: number): Promise<ProductionDetail[]>;
  findOneById(id: number): Promise<ProductionDetail | null>;
  create(
    input: Partial<ProductionDetail>,
    manager?: EntityManager,
  ): Promise<ProductionDetail>;
  update(
    detail: ProductionDetail,
    manager?: EntityManager,
  ): Promise<ProductionDetail>;
  remove(
    detail: ProductionDetail,
    manager?: EntityManager,
  ): Promise<ProductionDetail>;
}
