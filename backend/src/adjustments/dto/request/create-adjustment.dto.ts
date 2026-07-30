import { IsEnum, IsNumber, NotEquals } from 'class-validator';
import { AdjustmentType } from '../../../shared/enums/adjustmentType.enum';

export class CreateAdjustmentDto {
  @IsNumber()
  @NotEquals(0)
  stockChange!: number;

  @IsEnum(AdjustmentType)
  adjustmentType!: AdjustmentType;
}
