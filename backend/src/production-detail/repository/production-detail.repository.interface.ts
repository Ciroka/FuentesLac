import { ProductionDetail } from '../entities/production-detail.entity';

export const PRODUCTION_DETAIL_REPOSITORY = 'PRODUCTION_DETAIL_REPOSITORY';

export interface ProductionDetailRepository {
  findAll(): Promise<ProductionDetail[]>;
  findByProduction(productionId: number): Promise<ProductionDetail[]>;
  finById(id: number): Promise<ProductionDetail | null>;
  create(input: Partial<ProductionDetail>): Promise<ProductionDetail>;
  update(detail: ProductionDetail): Promise<ProductionDetail>;
  remove(detail: ProductionDetail): Promise<ProductionDetail>;
}
