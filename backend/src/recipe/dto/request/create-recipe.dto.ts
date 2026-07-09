import { IsOptional, IsString } from 'class-validator';

export class CreateRecipeDto {
  @IsString()
  @IsOptional()
  description?: string;
}
