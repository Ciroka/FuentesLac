import { Test, TestingModule } from '@nestjs/testing';
import { BatchController } from './batch.controller';
import { BatchService } from '../service/batch.service';
import { BATCH_REPOSITORY } from '../repository/batch.repository.interface';
import { SalesDetailService } from 'src/sales-detail/service/sales-detail.service';

describe('BatchController', () => {
  let controller: BatchController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BatchController],
      providers: [
        BatchService,
        { provide: BATCH_REPOSITORY, useValue: {} },
        { provide: SalesDetailService, useValue: {} },
      ],
    }).compile();

    controller = module.get<BatchController>(BatchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
