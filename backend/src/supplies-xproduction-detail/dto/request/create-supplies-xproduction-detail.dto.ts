import { IsInt, IsPositive } from 'class-validator';

export class CreateSuppliesXproductionDetailDto {
  @IsInt()
  @IsPositive()
  quantity!: number;

  @IsInt()
  @IsPositive()
  supplyId!: number;

  @IsInt()
  @IsPositive()
  productionDetailId!: number;
}
