import { PaymentMethod } from 'src/shared/enums';

export interface SaleDetailResponse {
  id: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  weight?: number;
  batch?: {
    id: number;
    product?: {
      id: number;
      name: string;
      salePrice: number;
    };
  };
}

export interface SaleResponse {
  id: number;
  date: Date;
  total: number;
  paymentMethod: PaymentMethod;
  clientId?: number;
  details?: SaleDetailResponse[];
}
