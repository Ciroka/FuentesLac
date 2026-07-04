import { Test, TestingModule } from '@nestjs/testing';
import { AdjustmentsController } from './adjustments.controller';
import { AdjustmentsService } from './adjustments.service';

describe('AdjustmentsController', () => {
  let controller: AdjustmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdjustmentsController],
      providers: [AdjustmentsService],
    }).compile();

    controller = module.get<AdjustmentsController>(AdjustmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
