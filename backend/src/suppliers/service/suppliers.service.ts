import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateSupplierDto,
  UpdateSupplierDto,
  QueryParamsSuppliers,
} from '../dto';
import { SUPPLIERS_REPOSITORY } from '../repository/suppliers.repository.interface';
import type { ISuppliersRepository } from '../repository/suppliers.repository.interface';
import { Supplier } from '../entities/supplier.entity';
import { PaginatedResult } from 'src/shared/pagination/pagination.type';

@Injectable()
export class SuppliersService {
  constructor(
    @Inject(SUPPLIERS_REPOSITORY)
    private readonly suppliersRepository: ISuppliersRepository,
  ) {}

  async findAll(
    params: QueryParamsSuppliers,
  ): Promise<PaginatedResult<Supplier>> {
    const { page, limit, order, name } = params;
    return this.suppliersRepository.findAll(page, limit, order, name);
  }

  async findOne(id: number): Promise<Supplier> {
    const supplier = await this.suppliersRepository.findOneById(id);
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  async create(createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    return this.suppliersRepository.create(createSupplierDto);
  }

  async update(
    id: number,
    updateSupplierDto: UpdateSupplierDto,
  ): Promise<Supplier> {
    const supplier = await this.findOne(id);

    if (updateSupplierDto.name !== undefined)
      supplier.name = updateSupplierDto.name;
    if (updateSupplierDto.phone !== undefined)
      supplier.phone = updateSupplierDto.phone;
    if (updateSupplierDto.email !== undefined)
      supplier.email = updateSupplierDto.email;
    if (updateSupplierDto.address !== undefined)
      supplier.address = updateSupplierDto.address;
    if (updateSupplierDto.cuit !== undefined)
      supplier.cuit = updateSupplierDto.cuit;

    return this.suppliersRepository.update(supplier);
  }

  async remove(id: number): Promise<Supplier> {
    const supplier = await this.findOne(id);
    return this.suppliersRepository.remove(supplier);
  }
}
