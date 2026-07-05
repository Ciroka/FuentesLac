import { Test, TestingModule } from '@nestjs/testing';
import { RecipeDetailService } from './recipe-detail.service';

describe('RecipeDetailService', () => {
  let service: RecipeDetailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecipeDetailService],
    }).compile();

    service = module.get<RecipeDetailService>(RecipeDetailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
