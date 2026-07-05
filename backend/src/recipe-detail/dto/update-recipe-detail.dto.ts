import { PartialType } from '@nestjs/mapped-types';
import { CreateRecipeDetailDto } from './create-recipe-detail.dto';

export class UpdateRecipeDetailDto extends PartialType(CreateRecipeDetailDto) {}
