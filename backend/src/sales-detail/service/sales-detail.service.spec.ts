import { Test, TestingModule } from '@nestjs/testing';
import { SalesDetailService } from './sales-detail.service';

describe('SalesDetailService', () => {
  let service: SalesDetailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SalesDetailService],
    }).compile();

    service = module.get<SalesDetailService>(SalesDetailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
