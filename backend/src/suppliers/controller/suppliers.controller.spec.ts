import { Test, TestingModule } from '@nestjs/testing';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from '../service/suppliers.service';
import { SUPPLIERS_REPOSITORY } from '../repository/suppliers.repository.interface';
import { ROLES_KEY } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/shared/enums';

describe('SuppliersController', () => {
  let controller: SuppliersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuppliersController],
      providers: [
        SuppliersService,
        { provide: SUPPLIERS_REPOSITORY, useValue: {} },
      ],
    }).compile();

    controller = module.get<SuppliersController>(SuppliersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('requires ADMIN role to create a supplier', () => {
    const roles = Reflect.getMetadata(
      ROLES_KEY,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      SuppliersController.prototype.create,
    );
    expect(roles).toEqual([UserRole.ADMIN]);
  });

  it('requires ADMIN role to update a supplier', () => {
    const roles = Reflect.getMetadata(
      ROLES_KEY,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      SuppliersController.prototype.update,
    );
    expect(roles).toEqual([UserRole.ADMIN]);
  });
});
