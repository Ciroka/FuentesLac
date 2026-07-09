import { IsEnum, IsNumber, IsPositive } from 'class-validator';
import { AdjustmentType } from '../../../shared/enums/adjustmentType.enum';

export class CreateAdjustmentDto {
  @IsNumber()
  @IsPositive()
  stockChange!: number;

  @IsEnum(AdjustmentType)
  adjustmentType!: AdjustmentType;
}
