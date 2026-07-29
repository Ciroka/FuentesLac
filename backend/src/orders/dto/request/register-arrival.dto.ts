import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsPositive,
  Min,
  ValidateNested,
} from 'class-validator';

export class ArrivalDetailDto {
  @IsInt()
  @IsPositive()
  supplyId!: number;

  @IsInt()
  @Min(0)
  quantity!: number;
}

export class RegisterArrivalDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ArrivalDetailDto)
  details!: ArrivalDetailDto[];
}
