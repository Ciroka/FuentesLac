import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { RecipeDetailService } from '../service/recipe-detail.service';
import { CreateRecipeDetailDto, UpdateRecipeDetailDto } from '../dto';

@Controller('recipe-detail')
export class RecipeDetailController {
  constructor(private readonly recipeDetailService: RecipeDetailService) {}

  @Post()
  create(@Body() createRecipeDetailDto: CreateRecipeDetailDto) {
    return this.recipeDetailService.create(createRecipeDetailDto);
  }

  @Get()
  findAll() {
    return this.recipeDetailService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recipeDetailService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRecipeDetailDto: UpdateRecipeDetailDto,
  ) {
    return this.recipeDetailService.update(+id, updateRecipeDetailDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recipeDetailService.remove(+id);
  }
}
