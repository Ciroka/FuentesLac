import { Test, TestingModule } from '@nestjs/testing';
import { BatchController } from './batch.controller';
import { BatchService } from '../service/batch.service';
import { BATCH_REPOSITORY } from '../repository/batch.repository.interface';
import { SalesDetailService } from 'src/sales-detail/service/sales-detail.service';
import { OrderEnum } from 'src/shared/enums/order.enum';
import { QueryParamsBatch } from '../dto';

describe('BatchController', () => {
  let controller: BatchController;
  const batchRepository = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BatchController],
      providers: [
        BatchService,
        { provide: BATCH_REPOSITORY, useValue: batchRepository },
        { provide: SalesDetailService, useValue: {} },
      ],
    }).compile();

    controller = module.get<BatchController>(BatchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll maps repository items through toBatchResponse and keeps pagination fields', async () => {
    const batch = {
      id: 1,
      currentStock: 10,
      productId: 5,
      yield: 0.12,
      product: { id: 5, name: 'Queso cremoso' },
    };
    (batchRepository as { findAll: jest.Mock }).findAll = jest
      .fn()
      .mockResolvedValue({ items: [batch], total: 1, page: 1, limit: 10 });

    const params: QueryParamsBatch = {
      page: 1,
      limit: 10,
      order: OrderEnum.ASC,
    };
    const result = await controller.findAll(params);

    expect(result).toEqual({
      items: [
        {
          id: 1,
          yield: 0.12,
          description: undefined,
          currentStock: 10,
          milkLitersUsed: undefined,
          obtainedWeight: undefined,
          clientBatchDate: undefined,
          clientBatchCode: undefined,
          productId: 5,
          product: { id: 5, name: 'Queso cremoso' },
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
    });
  });
});
