import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from '../service/categories.service';
import { CATEGORIES_REPOSITORY } from '../repository/categories.repository.interface';
import { ProductsService } from 'src/products/service/products.service';
import { ROLES_KEY } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/shared/enums';

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

  it('requires ADMIN role to create a category', () => {
    const roles = Reflect.getMetadata(
      ROLES_KEY,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      CategoriesController.prototype.create,
    );
    expect(roles).toEqual([UserRole.ADMIN]);
  });

  it('requires ADMIN role to update a category', () => {
    const roles = Reflect.getMetadata(
      ROLES_KEY,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      CategoriesController.prototype.update,
    );
    expect(roles).toEqual([UserRole.ADMIN]);
  });
});
