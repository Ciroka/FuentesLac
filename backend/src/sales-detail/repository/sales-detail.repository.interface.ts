import { SalesDetail } from '../entities/sales-detail.entity';

export const SALES_DETAIL_REPOSITORY = 'SALES_DETAIL_REPOSITORY';

export interface SalesDetailRepository {
  findAll(): Promise<SalesDetail[]>;
  findBySale(saleId: number): Promise<SalesDetail[]>;
  findOneById(id: number): Promise<SalesDetail | null>;
  create(input: Partial<SalesDetail>): Promise<SalesDetail>;
  update(detail: SalesDetail): Promise<SalesDetail>;
  remove(detail: SalesDetail): Promise<SalesDetail>;
}
