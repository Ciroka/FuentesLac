import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { PaymentMethod } from '../../../shared/enums/paymentMethod.enum';
import { Type } from 'class-transformer';
import { CreateSalesDetailDto } from 'src/sales-detail/dto';

export class CreateSaleDto {
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @IsInt()
  @IsOptional()
  clientId?: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSalesDetailDto)
  details!: CreateSalesDetailDto[];
}
