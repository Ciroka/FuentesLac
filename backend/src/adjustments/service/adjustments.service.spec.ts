import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, EntityManager } from 'typeorm';
import { AdjustmentsService } from './adjustments.service';
import { ADJUSTMENTS_REPOSITORY } from '../repository/adjustments.repository.interface';
import { BatchService } from 'src/batch/service/batch.service';
import { AdjustmentType } from 'src/shared/enums/adjustmentType.enum';
import { Adjustment } from '../entities/adjustment.entity';

describe('AdjustmentsService', () => {
  let service: AdjustmentsService;
  let batchService: { decreaseStock: jest.Mock; increaseStock: jest.Mock };
  let adjustmentRepo: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    remove: jest.Mock;
  };
  let dataSource: { transaction: jest.Mock };

  beforeEach(async () => {
    batchService = {
      decreaseStock: jest.fn().mockResolvedValue(undefined),
      increaseStock: jest.fn().mockResolvedValue(undefined),
    };
    adjustmentRepo = {
      create: jest.fn((a: Partial<Adjustment>) => a),
      save: jest.fn((a: Partial<Adjustment>) => Promise.resolve(a)),
      findOne: jest.fn(),
      remove: jest.fn((a: Adjustment) => Promise.resolve(a)),
    };
    dataSource = {
      transaction: jest.fn((cb: (manager: EntityManager) => unknown) => {
        const manager = {
          getRepository: () => adjustmentRepo,
        } as unknown as EntityManager;
        return cb(manager);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdjustmentsService,
        { provide: ADJUSTMENTS_REPOSITORY, useValue: {} },
        { provide: BatchService, useValue: batchService },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<AdjustmentsService>(AdjustmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('decreases stock for LOST, regardless of sign', async () => {
      await service.create(1, {
        stockChange: 5,
        adjustmentType: AdjustmentType.LOST,
      });

      expect(batchService.decreaseStock).toHaveBeenCalledWith(
        1,
        5,
        expect.anything(),
      );
      expect(batchService.increaseStock).not.toHaveBeenCalled();
    });

    it('increases stock for ADJUST with a positive stockChange', async () => {
      await service.create(1, {
        stockChange: 8,
        adjustmentType: AdjustmentType.ADJUST,
      });

      expect(batchService.increaseStock).toHaveBeenCalledWith(
        1,
        8,
        expect.anything(),
      );
      expect(batchService.decreaseStock).not.toHaveBeenCalled();
    });

    it('decreases stock for ADJUST with a negative stockChange, using the absolute amount', async () => {
      await service.create(1, {
        stockChange: -3,
        adjustmentType: AdjustmentType.ADJUST,
      });

      expect(batchService.decreaseStock).toHaveBeenCalledWith(
        1,
        3,
        expect.anything(),
      );
      expect(batchService.increaseStock).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('reverses a LOST adjustment by increasing stock', async () => {
      adjustmentRepo.findOne.mockResolvedValue({
        id: 1,
        batchId: 2,
        stockChange: 5,
        adjustmentType: AdjustmentType.LOST,
      });

      await service.remove(1);

      expect(batchService.increaseStock).toHaveBeenCalledWith(
        2,
        5,
        expect.anything(),
      );
      expect(batchService.decreaseStock).not.toHaveBeenCalled();
    });

    it('reverses a positive ADJUST by decreasing stock', async () => {
      adjustmentRepo.findOne.mockResolvedValue({
        id: 1,
        batchId: 2,
        stockChange: 8,
        adjustmentType: AdjustmentType.ADJUST,
      });

      await service.remove(1);

      expect(batchService.decreaseStock).toHaveBeenCalledWith(
        2,
        8,
        expect.anything(),
      );
      expect(batchService.increaseStock).not.toHaveBeenCalled();
    });

    it('reverses a negative ADJUST by increasing stock', async () => {
      adjustmentRepo.findOne.mockResolvedValue({
        id: 1,
        batchId: 2,
        stockChange: -4,
        adjustmentType: AdjustmentType.ADJUST,
      });

      await service.remove(1);

      expect(batchService.increaseStock).toHaveBeenCalledWith(
        2,
        4,
        expect.anything(),
      );
      expect(batchService.decreaseStock).not.toHaveBeenCalled();
    });
  });
});
