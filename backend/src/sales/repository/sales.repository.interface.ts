import { EntityManager } from 'typeorm';
import { OrderEnum } from '../../shared/enums/order.enum';
import { PaginatedResult } from '../../shared/pagination/pagination.type';
import { CreateSaleDto } from '../dto';
import { Sale } from '../entities/sale.entity';

export const SALES_REPOSITORY = 'SALES_REPOSITORY';

export interface SalesRepository {
  findAll(
    page: number,
    limit: number,
    order: OrderEnum,
    clientId?: number,
  ): Promise<PaginatedResult<Sale>>;
  findOneById(id: number): Promise<Sale | null>;
  create(input: CreateSaleDto): Promise<Sale>;
  update(sale: Sale): Promise<Sale>;
  remove(sale: Sale, manager?: EntityManager): Promise<Sale>;
}
