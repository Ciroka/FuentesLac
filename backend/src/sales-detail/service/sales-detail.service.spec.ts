import { Test, TestingModule } from '@nestjs/testing';
import { SalesDetailService } from './sales-detail.service';
import { SALES_DETAIL_REPOSITORY } from '../repository/sales-detail.repository.interface';

describe('SalesDetailService', () => {
  let service: SalesDetailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesDetailService,
        { provide: SALES_DETAIL_REPOSITORY, useValue: {} },
      ],
    }).compile();

    service = module.get<SalesDetailService>(SalesDetailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
