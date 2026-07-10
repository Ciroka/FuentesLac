import { PaymentMethod } from 'src/shared/enums';

export interface SaleResponse {
  id: number;
  date: Date;
  total: number;
  paymentMethod: PaymentMethod;
  clientId?: number;
}
