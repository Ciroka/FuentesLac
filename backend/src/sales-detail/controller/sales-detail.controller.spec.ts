import { Test, TestingModule } from '@nestjs/testing';
import { SalesDetailController } from './sales-detail.controller';
import { SalesDetailService } from '../service/sales-detail.service';
import { SALES_DETAIL_REPOSITORY } from '../repository/sales-detail.repository.interface';

describe('SalesDetailController', () => {
  let controller: SalesDetailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesDetailController],
      providers: [
        SalesDetailService,
        {
          provide: SALES_DETAIL_REPOSITORY,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<SalesDetailController>(SalesDetailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
