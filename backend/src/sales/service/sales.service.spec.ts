import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { SalesService } from './sales.service';
import { SALES_REPOSITORY } from '../repository/sales.repository.interface';
import { BatchService } from 'src/batch/service/batch.service';
import { ClientsService } from 'src/clients/service/clients.service';
import { StorageService } from 'src/storage';
import { Sale } from '../entities/sale.entity';
import { Client } from 'src/clients';

describe('SalesService', () => {
  let service: SalesService;
  let salesRepository: {
    findOneById: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };
  let clientsService: { findOne: jest.Mock };
  let batchService: { increaseStock: jest.Mock; subtractSoldWeight: jest.Mock };
  let dataSource: { transaction: jest.Mock };

  beforeEach(async () => {
    salesRepository = {
      findOneById: jest.fn(),
      update: jest.fn((sale: Partial<Sale>) => Promise.resolve(sale)),
      remove: jest.fn((sale: Partial<Sale>) => Promise.resolve(sale)),
    };
    clientsService = { findOne: jest.fn() };
    batchService = {
      increaseStock: jest.fn().mockResolvedValue(undefined),
      subtractSoldWeight: jest.fn().mockResolvedValue(undefined),
    };
    dataSource = {
      transaction: jest.fn((cb: (manager: EntityManager) => unknown) =>
        cb({} as EntityManager),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        { provide: SALES_REPOSITORY, useValue: salesRepository },
        { provide: DataSource, useValue: dataSource },
        { provide: BatchService, useValue: batchService },
        { provide: ClientsService, useValue: clientsService },
        { provide: StorageService, useValue: {} },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('update', () => {
    it('rejects attempts to edit sale details', async () => {
      await expect(
        service.update(1, { details: [{ batchId: 1, quantity: 2 }] } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException for a non-existent sale', async () => {
      salesRepository.findOneById.mockResolvedValue(null);

      await expect(service.update(999, {})).rejects.toThrow(NotFoundException);
    });

    it('applies the new clientId', async () => {
      const sale = { id: 1, client: undefined } as Sale;
      salesRepository.findOneById.mockResolvedValue(sale);
      const client = { id: 3 } as Client;
      clientsService.findOne.mockResolvedValue(client);

      await service.update(1, { clientId: 3 });

      expect(clientsService.findOne).toHaveBeenCalledWith(3);
      expect(salesRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({ client }),
      );
    });
  });

  describe('create', () => {
    let saleRepo: { create: jest.Mock; save: jest.Mock };
    let batch: { id: number; product: { salePrice: number } };

    beforeEach(() => {
      saleRepo = {
        create: jest.fn((data: unknown) => data),
        save: jest.fn((data: unknown) =>
          Promise.resolve({ id: 1, ...(data as object) }),
        ),
      };
      batch = { id: 10, product: { salePrice: 100 } };

      dataSource.transaction.mockImplementation(
        (cb: (manager: EntityManager) => unknown) =>
          cb({ getRepository: () => saleRepo } as unknown as EntityManager),
      );

      (
        batchService as unknown as {
          findOne: jest.Mock;
          decreaseStock: jest.Mock;
        }
      ).findOne = jest.fn().mockResolvedValue(batch);
      (batchService as unknown as { decreaseStock: jest.Mock }).decreaseStock =
        jest.fn().mockResolvedValue(undefined);
    });

    it('uses the product sale price when no unitPrice override is sent', async () => {
      await service.create({
        details: [{ batchId: 10, quantity: 2 }],
      });

      expect(saleRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          total: 200,
          details: [expect.objectContaining({ unitPrice: 100, subtotal: 200 })],
        }),
      );
    });

    it('uses the sent unitPrice override instead of the product sale price', async () => {
      await service.create({
        details: [{ batchId: 10, quantity: 2, unitPrice: 80 }],
      });

      expect(saleRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          total: 160,
          details: [expect.objectContaining({ unitPrice: 80, subtotal: 160 })],
        }),
      );
    });
  });

  describe('remove', () => {
    it('restores the stock and reverses the sold weight for every detail before deleting the sale', async () => {
      const sale = {
        id: 1,
        photoKey: null,
        details: [
          { batchId: 10, quantity: 3, weight: undefined },
          { batchId: 20, quantity: 1, weight: 2.5 },
        ],
      } as unknown as Sale;
      salesRepository.findOneById.mockResolvedValue(sale);

      await service.remove(1);

      expect(batchService.increaseStock).toHaveBeenCalledWith(
        10,
        3,
        expect.anything(),
      );
      expect(batchService.increaseStock).toHaveBeenCalledWith(
        20,
        1,
        expect.anything(),
      );
      expect(batchService.subtractSoldWeight).toHaveBeenCalledTimes(1);
      expect(batchService.subtractSoldWeight).toHaveBeenCalledWith(
        20,
        2.5,
        expect.anything(),
      );
      expect(salesRepository.remove).toHaveBeenCalledWith(
        sale,
        expect.anything(),
      );
    });

    it('throws NotFoundException for a non-existent sale', async () => {
      salesRepository.findOneById.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(batchService.increaseStock).not.toHaveBeenCalled();
    });
  });
});
