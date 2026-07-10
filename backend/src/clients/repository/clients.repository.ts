import { EntityManager, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PaginatedResult } from '../../shared/pagination/pagination.type';
import { OrderEnum } from '../../shared/enums/order.enum';
import { CreateClientDto } from '../dto';
import { IClientsRepository } from './clients.repository.interface';
import { Client } from '../entities/client.entity';

@Injectable()
export class ClientsRepository implements IClientsRepository {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async findAll(
    page: number,
    limit: number,
    order: OrderEnum,
    name?: string,
  ): Promise<PaginatedResult<Client>> {
    const query = this.clientRepository.createQueryBuilder('client');

    if (name) {
      query.where('client.name ILIKE :name', { name: `%${name}%` });
    }

    query.orderBy('client.name', order);
    const offset = (page - 1) * limit;

    const [clients, total] = await query
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    const paginatedResult: PaginatedResult<Client> = {
      items: clients,
      total,
      page,
      limit,
    };

    return paginatedResult;
  }

  async findOneById(
    id: number,
    manager?: EntityManager,
  ): Promise<Client | null> {
    return this.clientRepository.findOneBy({ id });
  }

  async create(input: CreateClientDto): Promise<Client> {
    return this.clientRepository.save(input);
  }

  async update(client: Client): Promise<Client> {
    return this.clientRepository.save(client);
  }

  async remove(client: Client): Promise<Client> {
    return this.clientRepository.remove(client);
  }
}
