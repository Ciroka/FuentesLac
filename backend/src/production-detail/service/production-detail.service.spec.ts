import { Test, TestingModule } from '@nestjs/testing';
import { ProductionDetailService } from './production-detail.service';
import { PRODUCTION_DETAIL_REPOSITORY } from '../repository/production-detail.repository.interface';

describe('ProductionDetailService', () => {
  let service: ProductionDetailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductionDetailService,
        { provide: PRODUCTION_DETAIL_REPOSITORY, useValue: {} },
      ],
    }).compile();

    service = module.get<ProductionDetailService>(ProductionDetailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
