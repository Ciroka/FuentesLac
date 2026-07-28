import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { SalesService } from './sales.service';
import { SALES_REPOSITORY } from '../repository/sales.repository.interface';
import { BatchService } from 'src/batch/service/batch.service';
import { ClientsService } from 'src/clients/service/clients.service';

describe('SalesService', () => {
  let service: SalesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        { provide: SALES_REPOSITORY, useValue: {} },
        { provide: DataSource, useValue: {} },
        { provide: BatchService, useValue: {} },
        { provide: ClientsService, useValue: {} },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
