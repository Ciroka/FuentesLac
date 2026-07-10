import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateSupplyDto, UpdateSupplyDto, QueryParamsSupplies } from '../dto';
import { SUPPLIES_REPOSITORY } from '../repository/supplies.repository.interface';
import type { ISuppliesRepository } from '../repository/supplies.repository.interface';
import { Supply } from '../entities/supply.entity';
import { PaginatedResult } from 'src/shared/pagination/pagination.type';
import { EntityManager } from 'typeorm';

@Injectable()
export class SuppliesService {
  constructor(
    @Inject(SUPPLIES_REPOSITORY)
    private readonly suppliesRepository: ISuppliesRepository,
  ) {}

  async findAll(params: QueryParamsSupplies): Promise<PaginatedResult<Supply>> {
    const { page, limit, order, name, categoryId } = params;
    return this.suppliesRepository.findAll(
      page,
      limit,
      order,
      name,
      categoryId,
    );
  }

  async findOne(id: number, manager?: EntityManager): Promise<Supply> {
    const supply = await this.suppliesRepository.findOneById(id, manager);
    if (!supply) throw new NotFoundException('Supply not found');
    return supply;
  }

  async create(createSupplyDto: CreateSupplyDto): Promise<Supply> {
    return this.suppliesRepository.create(createSupplyDto);
  }

  async update(
    id: number,
    updateSupplyDto: UpdateSupplyDto,
    manager?: EntityManager,
  ): Promise<Supply> {
    const supply = await this.findOne(id);

    if (updateSupplyDto.name !== undefined) supply.name = updateSupplyDto.name;
    if (updateSupplyDto.costPrice !== undefined)
      supply.costPrice = updateSupplyDto.costPrice;
    //if (updateSupplyDto.currentStock !== undefined)
    //supply.currentStock = updateSupplyDto.currentStock;
    if (updateSupplyDto.minStock !== undefined)
      supply.minStock = updateSupplyDto.minStock;
    if (updateSupplyDto.supplierId !== undefined)
      supply.supplierId = updateSupplyDto.supplierId;
    if (updateSupplyDto.categoryId !== undefined)
      supply.categoryId = updateSupplyDto.categoryId;

    return this.suppliesRepository.update(supply, manager);
  }

  async decreaseStock(
    supply: Supply,
    stock: number,
    manager?: EntityManager,
  ): Promise<Supply> {
    if (stock > supply.currentStock)
      throw new BadRequestException('Insufficient stock');
    supply.currentStock -= stock;
    return this.suppliesRepository.update(supply, manager);
  }

  async increaseStock(
    supply: Supply,
    stock: number,
    manager?: EntityManager,
  ): Promise<Supply> {
    supply.currentStock += stock;
    return this.suppliesRepository.update(supply, manager);
  }

  async remove(id: number): Promise<Supply> {
    const supply = await this.findOne(id);
    return this.suppliesRepository.remove(supply);
  }
}
