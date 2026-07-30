import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { CATEGORIES_REPOSITORY } from '../repository/categories.repository.interface';
import { ProductsService } from 'src/products/service/products.service';
import { OrderEnum } from 'src/shared/enums/order.enum';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repository: { findAll: jest.Mock };

  beforeEach(async () => {
    repository = {
      findAll: jest
        .fn()
        .mockResolvedValue({ items: [], total: 0, page: 1, limit: 10 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: CATEGORIES_REPOSITORY, useValue: repository },
        { provide: ProductsService, useValue: {} },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('forwards usedBy from the query params to the repository', async () => {
    await service.findAll({
      page: 1,
      limit: 10,
      order: OrderEnum.ASC,
      usedBy: 'products',
    });

    expect(repository.findAll).toHaveBeenCalledWith(
      1,
      10,
      OrderEnum.ASC,
      undefined,
      undefined,
      'products',
    );
  });
});
