import { Test, TestingModule } from '@nestjs/testing';
import { RecipeDetailController } from './recipe-detail.controller';
import { RecipeDetailService } from '../service/recipe-detail.service';

describe('RecipeDetailController', () => {
  let controller: RecipeDetailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecipeDetailController],
      providers: [RecipeDetailService],
    }).compile();

    controller = module.get<RecipeDetailController>(RecipeDetailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
