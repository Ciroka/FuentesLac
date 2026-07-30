import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateSaleDto, UpdateSaleDto, QueryParamsSales } from '../dto';
import { SALES_REPOSITORY } from '../repository/sales.repository.interface';
import type { SalesRepository } from '../repository/sales.repository.interface';
import { Sale } from '../entities/sale.entity';
import { DataSource } from 'typeorm';
import { PaginatedResult } from 'src/shared/pagination/pagination.type';
import { Batch } from 'src/batch/entities/batch.entity';
import { BatchService } from 'src/batch/service/batch.service';
import { ClientsService } from 'src/clients/service/clients.service';
import { Client } from 'src/clients';
import { StorageService } from 'src/storage';

const SALES_PHOTO_FOLDER = 'sales';

export type SaleWithPhoto = Sale & { photoUrl?: string | null };

@Injectable()
export class SalesService {
  constructor(
    @Inject(SALES_REPOSITORY)
    private readonly salesRepository: SalesRepository,
    private readonly dataSource: DataSource,
    private readonly batchService: BatchService,
    private readonly clientsService: ClientsService,
    private readonly storageService: StorageService,
  ) {}

  async findAll(
    params: QueryParamsSales,
  ): Promise<PaginatedResult<SaleWithPhoto>> {
    const { page, limit, order, clientId } = params;
    const result = await this.salesRepository.findAll(
      page,
      limit,
      order,
      clientId,
    );

    return {
      ...result,
      items: await Promise.all(
        result.items.map((sale) => this.toResponse(sale)),
      ),
    };
  }

  async findOne(id: number): Promise<SaleWithPhoto> {
    return this.toResponse(await this.findSaleOrFail(id));
  }

  async create(createSaleDto: CreateSaleDto): Promise<SaleWithPhoto> {
    const sale = await this.dataSource.transaction(async (manager) => {
      const saleRepo = manager.getRepository(Sale);
      let total = 0;
      const items: {
        batch: Batch;
        unitPrice: number;
        quantity: number;
        subtotal: number;
        weight?: number;
      }[] = [];

      for (const item of createSaleDto.details) {
        const batch = await this.batchService.findOne(item.batchId, manager);
        const unitPrice = batch.product.salePrice;
        const subtotal = unitPrice * item.quantity;
        total += subtotal;

        await this.batchService.decreaseStock(batch.id, item.quantity, manager);

        if (item.weight) {
          await this.batchService.addSoldWeight(batch.id, item.weight, manager);
        }

        items.push({
          batch,
          unitPrice,
          quantity: item.quantity,
          subtotal,
          weight: item.weight,
        });
      }

      let client: Client | undefined;
      if (createSaleDto.clientId) {
        client = await this.clientsService.findOne(
          createSaleDto.clientId,
          manager,
        );
      }

      const newSale = saleRepo.create({
        total,
        ...(client && { client }),
        details: items.map((item) => ({
          batch: item.batch,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
          weight: item.weight,
        })),
      });

      return saleRepo.save(newSale);
    });

    return this.toResponse(sale);
  }

  async update(
    id: number,
    updateSaleDto: UpdateSaleDto,
  ): Promise<SaleWithPhoto> {
    if (updateSaleDto.details) {
      throw new BadRequestException(
        'No se pueden editar los renglones de una venta ya creada.',
      );
    }

    const sale = await this.findSaleOrFail(id);

    if (updateSaleDto.clientId !== undefined) {
      sale.client = await this.clientsService.findOne(updateSaleDto.clientId);
    }

    return this.toResponse(await this.salesRepository.update(sale));
  }

  async remove(id: number): Promise<SaleWithPhoto> {
    const sale = await this.findSaleOrFail(id);
    const photoKey = sale.photoKey;

    const removed = await this.dataSource.transaction(async (manager) => {
      for (const detail of sale.details) {
        await this.batchService.increaseStock(
          detail.batchId,
          detail.quantity,
          manager,
        );
        if (detail.weight) {
          await this.batchService.subtractSoldWeight(
            detail.batchId,
            detail.weight,
            manager,
          );
        }
      }

      return this.salesRepository.remove(sale, manager);
    });

    if (photoKey) {
      await this.storageService.remove(photoKey);
    }

    removed.photoKey = null;
    return this.toResponse(removed);
  }

  /**
   * Guarda la foto de la venta en R2. Cada venta tiene una sola foto:
   * si ya había una, se reemplaza y la anterior se borra del bucket.
   */
  async uploadPhoto(
    id: number,
    file: Express.Multer.File,
  ): Promise<SaleWithPhoto> {
    const sale = await this.findSaleOrFail(id);
    const previousKey = sale.photoKey;

    sale.photoKey = await this.storageService.upload(
      file,
      SALES_PHOTO_FOLDER,
      String(sale.id),
    );
    const saved = await this.salesRepository.update(sale);

    if (previousKey && previousKey !== saved.photoKey) {
      await this.storageService.remove(previousKey);
    }

    return this.toResponse(saved);
  }

  async removePhoto(id: number): Promise<SaleWithPhoto> {
    const sale = await this.findSaleOrFail(id);
    const previousKey = sale.photoKey;

    sale.photoKey = null;
    const saved = await this.salesRepository.update(sale);

    if (previousKey) {
      await this.storageService.remove(previousKey);
    }

    return this.toResponse(saved);
  }

  private async findSaleOrFail(id: number): Promise<Sale> {
    const sale = await this.salesRepository.findOneById(id);
    if (!sale) throw new NotFoundException('Sale not found');
    return sale;
  }

  /** La key interna del bucket no se expone: el cliente sólo recibe la URL. */
  private async toResponse(sale: Sale): Promise<SaleWithPhoto> {
    const { photoKey, ...rest } = sale;

    return {
      ...rest,
      photoUrl: photoKey ? await this.storageService.getUrl(photoKey) : null,
    };
  }
}
