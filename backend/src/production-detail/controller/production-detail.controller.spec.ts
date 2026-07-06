import { Test, TestingModule } from '@nestjs/testing';
import { ProductionDetailController } from './production-detail.controller';
import { ProductionDetailService } from '../service/production-detail.service';

describe('ProductionDetailController', () => {
  let controller: ProductionDetailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductionDetailController],
      providers: [ProductionDetailService],
    }).compile();
    controller = module.get<ProductionDetailController>(
      ProductionDetailController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
