import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PaginatedResult } from '../../shared/pagination/pagination.type';
import { OrderEnum } from '../../shared/enums/order.enum';
import { CreateSupplierDto } from '../dto';
import { ISuppliersRepository } from './suppliers.repository.interface';
import { Supplier } from '../entities/supplier.entity';

@Injectable()
export class SuppliersRepository implements ISuppliersRepository {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  async findAll(
    page: number,
    limit: number,
    order: OrderEnum,
    name?: string,
  ): Promise<PaginatedResult<Supplier>> {
    const query = this.supplierRepository.createQueryBuilder('supplier');

    if (name) {
      query.where('supplier.name ILIKE :name', { name: `%${name}%` });
    }

    query.orderBy('supplier.name', order);
    const offset = (page - 1) * limit;

    const [suppliers, total] = await query
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    const paginatedResult: PaginatedResult<Supplier> = {
      items: suppliers,
      total,
      page,
      limit,
    };

    return paginatedResult;
  }

  async findOneById(id: number): Promise<Supplier | null> {
    return this.supplierRepository.findOneBy({ id });
  }

  async create(input: CreateSupplierDto): Promise<Supplier> {
    return this.supplierRepository.save(input);
  }

  async update(supplier: Supplier): Promise<Supplier> {
    return this.supplierRepository.save(supplier);
  }

  async remove(supplier: Supplier): Promise<Supplier> {
    return this.supplierRepository.remove(supplier);
  }
}
