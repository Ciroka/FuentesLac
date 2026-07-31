import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { SalesController } from './sales.controller';
import { SalesService } from '../service/sales.service';
import { SALES_REPOSITORY } from '../repository/sales.repository.interface';
import { BatchService } from 'src/batch/service/batch.service';
import { ClientsService } from 'src/clients/service/clients.service';
import { StorageService } from 'src/storage';

describe('SalesController', () => {
  let controller: SalesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesController],
      providers: [
        SalesService,
        { provide: SALES_REPOSITORY, useValue: {} },
        { provide: DataSource, useValue: {} },
        { provide: BatchService, useValue: {} },
        { provide: ClientsService, useValue: {} },
        { provide: StorageService, useValue: {} },
      ],
    }).compile();

    controller = module.get<SalesController>(SalesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
