import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductionDto, QueryParamsProduction } from '../dto';
import { PRODUCTION_REPOSITORY } from '../repository/production.repository.interface';
import type { ProductionRepository } from '../repository/production.repository.interface';
import { Production } from '../entities/production.entity';
import { PaginatedResult } from 'src/shared/pagination/pagination.type';
import { DataSource } from 'typeorm';
import { ProductsService } from 'src/products/service/products.service';
import { Product } from 'src/products';
import { Supply } from 'src/supplies';
import { SuppliesService } from 'src/supplies/service/supplies.service';

@Injectable()
export class ProductionService {
  constructor(
    @Inject(PRODUCTION_REPOSITORY)
    private readonly productionRepository: ProductionRepository,
    private readonly supplyService: SuppliesService,
    private readonly productService: ProductsService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(
    params: QueryParamsProduction,
  ): Promise<PaginatedResult<Production>> {
    const { page, limit, order } = params;
    return this.productionRepository.findAll(page, limit, order);
  }

  async findOne(id: number): Promise<Production> {
    const production = await this.productionRepository.findOneById(id);
    if (!production) throw new NotFoundException('Production not found');
    return production;
  }

  async create(createProductionDto: CreateProductionDto): Promise<Production> {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Production);
      const items: {
        product: Product;
        quantity: number;
        supplies: { supply: Supply; quantity: number }[];
      }[] = [];

      for (const item of createProductionDto.details) {
        const product = await this.productService.findOne(
          item.productId,
          manager,
        );

        const supplies: { supply: Supply; quantity: number }[] = [];
        for (const s of item.details) {
          const supply = await this.supplyService.findOne(s.supplyId, manager);
          await this.supplyService.decreaseStock(supply.id, s.quantity, manager);
          supplies.push({ supply, quantity: s.quantity });
        }
        await this.productService.increaseStock(
          product.id,
          item.quantity,
          manager,
        );
        items.push({ product, quantity: item.quantity, supplies });
      }

      const production = repo.create({
        details: items.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          supplyXDetail: item.supplies.map((s) => ({
            supply: s.supply,
            quantity: s.quantity,
          })),
        })),
      });

      return repo.save(production);
    });
  }

  // async update(id: number, updateProductionDto: UpdateProductionDto): Promise<Production> {

  // }

  // async remove(id: number): Promise<Production> {
  //   const production = await this.findOne(id);
  //   return this.productionRepository.remove(production);
  // } creo que no se va a usar
}
