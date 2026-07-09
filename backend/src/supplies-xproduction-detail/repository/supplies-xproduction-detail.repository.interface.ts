import { SuppliesXproductionDetail } from '../entities/supplies-xproduction-detail.entity';
import { EntityManager } from 'typeorm';

export const SUPPLIES_XPRODUCTION_DETAIL_REPOSITORY =
  'SUPPLIES_XPRODUCTION_DETAIL_REPOSITORY';

export interface ISuppliesXproductionDetailRepository {
  findAll(): Promise<SuppliesXproductionDetail[]>;
  finById(
    id: number,
    manager?: EntityManager,
  ): Promise<SuppliesXproductionDetail | null>;
  create(
    input: Partial<SuppliesXproductionDetail>,
    manager?: EntityManager,
  ): Promise<SuppliesXproductionDetail>;
  update(
    detail: SuppliesXproductionDetail,
    manager?: EntityManager,
  ): Promise<SuppliesXproductionDetail>;
  remove(detail: SuppliesXproductionDetail): Promise<SuppliesXproductionDetail>;
}
