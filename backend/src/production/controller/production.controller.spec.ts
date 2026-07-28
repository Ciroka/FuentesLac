import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { ProductionController } from './production.controller';
import { ProductionService } from '../service/production.service';
import { PRODUCTION_REPOSITORY } from '../repository/production.repository.interface';
import { SuppliesService } from 'src/supplies/service/supplies.service';
import { ProductsService } from 'src/products/service/products.service';
import { BatchService } from 'src/batch/service/batch.service';

describe('ProductionController', () => {
  let controller: ProductionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductionController],
      providers: [
        ProductionService,
        { provide: PRODUCTION_REPOSITORY, useValue: {} },
        { provide: SuppliesService, useValue: {} },
        { provide: ProductsService, useValue: {} },
        { provide: BatchService, useValue: {} },
        { provide: DataSource, useValue: {} },
      ],
    }).compile();

    controller = module.get<ProductionController>(ProductionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
