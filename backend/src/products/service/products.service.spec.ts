import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PRODUCTS_REPOSITORY } from '../repository/products.repository.interface';
import { BatchService } from 'src/batch/service/batch.service';
import { OrderEnum } from 'src/shared/enums/order.enum';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: { findAll: jest.Mock };

  beforeEach(async () => {
    repository = {
      findAll: jest
        .fn()
        .mockResolvedValue({ items: [], total: 0, page: 1, limit: 10 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PRODUCTS_REPOSITORY, useValue: repository },
        { provide: BatchService, useValue: {} },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('forwards categoryId from the query params to the repository', async () => {
    await service.findAll({
      page: 1,
      limit: 10,
      order: OrderEnum.ASC,
      categoryId: 3,
    });

    expect(repository.findAll).toHaveBeenCalledWith(
      1,
      10,
      OrderEnum.ASC,
      undefined,
      undefined,
      3,
    );
  });
});
