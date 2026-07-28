import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AdjustmentsController } from './adjustments.controller';
import { AdjustmentsService } from '../service/adjustments.service';
import { ADJUSTMENTS_REPOSITORY } from '../repository/adjustments.repository.interface';
import { BatchService } from 'src/batch/service/batch.service';

describe('AdjustmentsController', () => {
  let controller: AdjustmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdjustmentsController],
      providers: [
        AdjustmentsService,
        { provide: ADJUSTMENTS_REPOSITORY, useValue: {} },
        { provide: BatchService, useValue: {} },
        { provide: DataSource, useValue: {} },
      ],
    }).compile();

    controller = module.get<AdjustmentsController>(AdjustmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
