import { OrderEnum } from '../../shared/enums/order.enum';
import { PaginatedResult } from '../../shared/pagination/pagination.type';
import { Production } from '../entities/production.entity';

export const PRODUCTION_REPOSITORY = 'PRODUCTION_REPOSITORY';

export interface ProductionRepository {
  findAll(
    page: number,
    limit: number,
    order: OrderEnum,
  ): Promise<PaginatedResult<Production>>;
  finById(id: number): Promise<Production | null>;
  create(input: Partial<Production>): Promise<Production>;
  update(production: Production): Promise<Production>;
  remove(production: Production): Promise<Production>;
}
