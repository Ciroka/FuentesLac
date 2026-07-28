import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { CATEGORIES_REPOSITORY } from '../repository/categories.repository.interface';
import { ProductsService } from 'src/products/service/products.service';

describe('CategoriesService', () => {
  let service: CategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: CATEGORIES_REPOSITORY, useValue: {} },
        { provide: ProductsService, useValue: {} },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
