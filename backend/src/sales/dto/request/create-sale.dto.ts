import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { PaymentMethod } from '../../../shared/enums/paymentMethod.enum';

export class CreateSaleDto {
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @IsInt()
  @IsOptional()
  clientId?: number;
}
