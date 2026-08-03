import { Test, TestingModule } from '@nestjs/testing';
import { SuppliesController } from './supplies.controller';
import { SuppliesService } from '../service/supplies.service';
import { SUPPLIES_REPOSITORY } from '../repository/supplies.repository.interface';
import { ROLES_KEY } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/shared/enums';

describe('SuppliesController', () => {
  let controller: SuppliesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuppliesController],
      providers: [
        SuppliesService,
        { provide: SUPPLIES_REPOSITORY, useValue: {} },
      ],
    }).compile();

    controller = module.get<SuppliesController>(SuppliesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('requires ADMIN role to update a supply', () => {
    const roles = Reflect.getMetadata(
      ROLES_KEY,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      SuppliesController.prototype.update,
    );
    expect(roles).toEqual([UserRole.ADMIN]);
  });
});
