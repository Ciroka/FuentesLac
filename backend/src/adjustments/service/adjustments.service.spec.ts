import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AdjustmentsService } from './adjustments.service';
import { ADJUSTMENTS_REPOSITORY } from '../repository/adjustments.repository.interface';
import { BatchService } from 'src/batch/service/batch.service';

describe('AdjustmentsService', () => {
  let service: AdjustmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdjustmentsService,
        { provide: ADJUSTMENTS_REPOSITORY, useValue: {} },
        { provide: BatchService, useValue: {} },
        { provide: DataSource, useValue: {} },
      ],
    }).compile();

    service = module.get<AdjustmentsService>(AdjustmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
