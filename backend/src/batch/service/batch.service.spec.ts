import { Test, TestingModule } from '@nestjs/testing';
import { BatchService } from './batch.service';
import { BATCH_REPOSITORY } from '../repository/batch.repository.interface';
import { SalesDetailService } from 'src/sales-detail/service/sales-detail.service';

describe('BatchService', () => {
  let service: BatchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BatchService,
        { provide: BATCH_REPOSITORY, useValue: {} },
        { provide: SalesDetailService, useValue: {} },
      ],
    }).compile();

    service = module.get<BatchService>(BatchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
