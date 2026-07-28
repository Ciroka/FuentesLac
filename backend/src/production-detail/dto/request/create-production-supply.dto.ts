import { IsInt, IsPositive } from 'class-validator';

export class CreateProductionSupplyDto {
  @IsInt()
  @IsPositive()
  quantity!: number;

  @IsInt()
  @IsPositive()
  supplyId!: number;
}
