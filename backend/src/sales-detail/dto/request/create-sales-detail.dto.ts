import { IsInt, IsPositive } from 'class-validator';

export class CreateSalesDetailDto {
  @IsInt()
  @IsPositive()
  quantity!: number;

  @IsInt()
  @IsPositive()
  saleId!: number;

  @IsInt()
  @IsPositive()
  productId!: number;
}
