import { Test, TestingModule } from '@nestjs/testing';
import { SuppliesService } from './supplies.service';
import { SUPPLIES_REPOSITORY } from '../repository/supplies.repository.interface';

describe('SuppliesService', () => {
  let service: SuppliesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuppliesService,
        { provide: SUPPLIES_REPOSITORY, useValue: {} },
      ],
    }).compile();

    service = module.get<SuppliesService>(SuppliesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
