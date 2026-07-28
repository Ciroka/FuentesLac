import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from '../service/categories.service';
import { CATEGORIES_REPOSITORY } from '../repository/categories.repository.interface';
import { ProductsService } from 'src/products/service/products.service';

describe('CategoriesController', () => {
  let controller: CategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        CategoriesService,
        { provide: CATEGORIES_REPOSITORY, useValue: {} },
        { provide: ProductsService, useValue: {} },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
