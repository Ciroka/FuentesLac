import { Test, TestingModule } from '@nestjs/testing';
import { ProductionDetailService } from './production-detail.service';

describe('ProductionDetailService', () => {
  let service: ProductionDetailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductionDetailService],
    }).compile();

    service = module.get<ProductionDetailService>(ProductionDetailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
