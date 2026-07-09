import { OrderEnum } from '../../shared/enums/order.enum';
import { PaginatedResult } from '../../shared/pagination/pagination.type';
import { CreateSupplierDto } from '../dto';
import { Supplier } from '../entities/supplier.entity';

export const SUPPLIERS_REPOSITORY = 'SUPPLIERS_REPOSITORY';

export interface ISuppliersRepository {
  findAll(
    page: number,
    limit: number,
    order: OrderEnum,
    name?: string,
  ): Promise<PaginatedResult<Supplier>>;
  finById(id: number): Promise<Supplier | null>;
  create(input: CreateSupplierDto): Promise<Supplier>;
  update(supplier: Supplier): Promise<Supplier>;
  remove(supplier: Supplier): Promise<Supplier>;
}
