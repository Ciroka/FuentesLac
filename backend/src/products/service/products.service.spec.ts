import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PRODUCTS_REPOSITORY } from '../repository/products.repository.interface';
import { BatchService } from 'src/batch/service/batch.service';

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PRODUCTS_REPOSITORY, useValue: {} },
        { provide: BatchService, useValue: {} },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
