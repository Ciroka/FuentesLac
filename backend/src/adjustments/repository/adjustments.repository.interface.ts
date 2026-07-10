import { OrderEnum } from '../../shared/enums/order.enum';
import { PaginatedResult } from '../../shared/pagination/pagination.type';
import { Adjustment } from '../entities/adjustment.entity';

export const ADJUSTMENTS_REPOSITORY = 'ADJUSTMENTS_REPOSITORY';

export interface IAdjustmentsRepository {
  findAll(
    page: number,
    limit: number,
    order: OrderEnum,
    productId?: number,
  ): Promise<PaginatedResult<Adjustment>>;
  findOneById(id: number): Promise<Adjustment | null>;
  // create(input: CreateAdjustmentDto): Promise<Adjustment>;
  // update(adjustment: Adjustment): Promise<Adjustment>;
  remove(adjustment: Adjustment): Promise<Adjustment>;
}
