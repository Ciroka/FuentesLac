import { Test, TestingModule } from '@nestjs/testing';
import { ProductionDetailController } from './production-detail.controller';
import { ProductionDetailService } from '../service/production-detail.service';
import { PRODUCTION_DETAIL_REPOSITORY } from '../repository/production-detail.repository.interface';

describe('ProductionDetailController', () => {
  let controller: ProductionDetailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductionDetailController],
      providers: [
        ProductionDetailService,
        { provide: PRODUCTION_DETAIL_REPOSITORY, useValue: {} },
      ],
    }).compile();
    controller = module.get<ProductionDetailController>(
      ProductionDetailController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
