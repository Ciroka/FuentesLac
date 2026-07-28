import { Test, TestingModule } from '@nestjs/testing';
import { SuppliesController } from './supplies.controller';
import { SuppliesService } from '../service/supplies.service';
import { SUPPLIES_REPOSITORY } from '../repository/supplies.repository.interface';

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
});
