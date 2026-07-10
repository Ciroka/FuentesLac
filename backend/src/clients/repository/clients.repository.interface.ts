import { OrderEnum } from '../../shared/enums/order.enum';
import { PaginatedResult } from '../../shared/pagination/pagination.type';
import { CreateClientDto } from '../dto';
import { Client } from '../entities/client.entity';

export const CLIENTS_REPOSITORY = 'CLIENTS_REPOSITORY';

export interface IClientsRepository {
  findAll(
    page: number,
    limit: number,
    order: OrderEnum,
    name?: string,
  ): Promise<PaginatedResult<Client>>;
  findOneById(id: number): Promise<Client | null>;
  create(input: CreateClientDto): Promise<Client>;
  update(client: Client): Promise<Client>;
  remove(client: Client): Promise<Client>;
}
