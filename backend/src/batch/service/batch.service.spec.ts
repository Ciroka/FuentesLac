import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { BatchService } from './batch.service';
import { BATCH_REPOSITORY } from '../repository/batch.repository.interface';
import { SalesDetailService } from 'src/sales-detail/service/sales-detail.service';
import { Batch } from '../entities/batch.entity';
import { OrderEnum } from 'src/shared/enums/order.enum';
import { SortByBatch } from '../enums/sort-by.enum';

describe('BatchService', () => {
  let service: BatchService;
  let batchRepository: {
    findAll: jest.Mock;
    decreaseStockAtomic: jest.Mock;
    increaseStockAtomic: jest.Mock;
  };

  beforeEach(async () => {
    batchRepository = {
      findAll: jest.fn(),
      decreaseStockAtomic: jest.fn(),
      increaseStockAtomic: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BatchService,
        { provide: BATCH_REPOSITORY, useValue: batchRepository },
        { provide: SalesDetailService, useValue: {} },
      ],
    }).compile();

    service = module.get<BatchService>(BatchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('decreaseStock', () => {
    it('returns the updated batch when the atomic update affects a row', async () => {
      const updated = { id: 1, currentStock: 5 } as Batch;
      batchRepository.decreaseStockAtomic.mockResolvedValue(updated);

      await expect(service.decreaseStock(1, 5)).resolves.toBe(updated);
    });

    it('throws when the atomic update affects no rows (insufficient stock)', async () => {
      batchRepository.decreaseStockAtomic.mockResolvedValue(null);

      await expect(service.decreaseStock(1, 5)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('increaseStock', () => {
    it('returns the updated batch when the atomic update affects a row', async () => {
      const updated = { id: 1, currentStock: 15 } as Batch;
      batchRepository.increaseStockAtomic.mockResolvedValue(updated);

      await expect(service.increaseStock(1, 5)).resolves.toBe(updated);
    });

    it('throws when the atomic update affects no rows', async () => {
      batchRepository.increaseStockAtomic.mockResolvedValue(null);

      await expect(service.increaseStock(1, 5)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('passes the destructured query params through to the repository', async () => {
      const paginated = { items: [], total: 0, page: 2, limit: 5 };
      batchRepository.findAll.mockResolvedValue(paginated);

      const result = await service.findAll({
        page: 2,
        limit: 5,
        order: OrderEnum.DESC,
        sortBy: SortByBatch.YIELD,
        productId: 7,
      });

      expect(batchRepository.findAll).toHaveBeenCalledWith(
        2,
        5,
        OrderEnum.DESC,
        SortByBatch.YIELD,
        7,
      );
      expect(result).toBe(paginated);
    });
  });
});
