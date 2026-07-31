import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { ProductionService } from './production.service';
import { PRODUCTION_REPOSITORY } from '../repository/production.repository.interface';
import { SuppliesService } from 'src/supplies/service/supplies.service';
import { ProductsService } from 'src/products/service/products.service';
import { BatchService } from 'src/batch/service/batch.service';

describe('ProductionService', () => {
  let service: ProductionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductionService,
        { provide: PRODUCTION_REPOSITORY, useValue: {} },
        { provide: SuppliesService, useValue: {} },
        { provide: ProductsService, useValue: {} },
        { provide: BatchService, useValue: {} },
        { provide: DataSource, useValue: {} },
      ],
    }).compile();

    service = module.get<ProductionService>(ProductionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
