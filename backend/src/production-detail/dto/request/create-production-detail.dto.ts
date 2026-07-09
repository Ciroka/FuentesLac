import { IsInt, IsPositive } from 'class-validator';

export class CreateProductionDetailDto {
  @IsInt()
  @IsPositive()
  quantity!: number;

  @IsInt()
  @IsPositive()
  productionId!: number;

  @IsInt()
  @IsPositive()
  productId!: number;
}
