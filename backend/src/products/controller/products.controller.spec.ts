import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from '../service/products.service';
import { PRODUCTS_REPOSITORY } from '../repository/products.repository.interface';
import { BatchService } from 'src/batch/service/batch.service';
import { ROLES_KEY } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/shared/enums';

describe('ProductsController', () => {
  let controller: ProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        ProductsService,
        { provide: PRODUCTS_REPOSITORY, useValue: {} },
        { provide: BatchService, useValue: {} },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('requires ADMIN role to update a product', () => {
    const roles = Reflect.getMetadata(
      ROLES_KEY,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      ProductsController.prototype.update,
    );
    expect(roles).toEqual([UserRole.ADMIN]);
  });
});
