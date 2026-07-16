import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { CreateClientDto, UpdateClientDto, QueryParamsClients } from '../dto';
import { CLIENTS_REPOSITORY } from '../repository/clients.repository.interface';
import type { IClientsRepository } from '../repository/clients.repository.interface';
import { Client } from '../entities/client.entity';
import { PaginatedResult } from 'src/shared/pagination/pagination.type';
import { EntityManager } from 'typeorm';

@Injectable()
export class ClientsService {
  constructor(
    @Inject(CLIENTS_REPOSITORY)
    private readonly clientsRepository: IClientsRepository,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    return this.clientsRepository.create(createClientDto);
  }

  async findAll(params: QueryParamsClients): Promise<PaginatedResult<Client>> {
    const { page, limit, order, name } = params;
    return this.clientsRepository.findAll(page, limit, order, name);
  }

  async findOne(id: number, manager?: EntityManager): Promise<Client> {
    const client = await this.clientsRepository.findOneById(id, manager);
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  async update(id: number, updateClientDto: UpdateClientDto): Promise<Client> {
    const client = await this.findOne(id);

    if (updateClientDto.name !== undefined) client.name = updateClientDto.name;
    if (updateClientDto.lastName !== undefined)
      client.lastName = updateClientDto.lastName;
    if (updateClientDto.phone !== undefined)
      client.phone = updateClientDto.phone;
    if (updateClientDto.cuit !== undefined) client.cuit = updateClientDto.cuit;
    if (updateClientDto.email !== undefined)
      client.email = updateClientDto.email;

    return this.clientsRepository.update(client);
  }

  async remove(id: number): Promise<Client> {
    const client = await this.findOne(id);
    return this.clientsRepository.softRemove(client);
  }
}
