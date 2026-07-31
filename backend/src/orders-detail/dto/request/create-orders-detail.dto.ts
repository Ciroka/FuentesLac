import { IsInt, IsPositive } from 'class-validator';

export class CreateOrdersDetailDto {
  @IsInt()
  @IsPositive()
  supplyId!: number;

  @IsInt()
  @IsPositive()
  quantity!: number;
}
