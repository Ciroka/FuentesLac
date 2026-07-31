import { OrderStatus } from '../../../shared/enums/orderStatus.enum';

export interface OrderDetailResponse {
  id: number;
  supply: { id: number; name: string };
  orderedQuantity: number;
  arrivalQuantity: number;
  unitPrice: number;
  orderedSubtotal: number;
  arrivalSubtotal: number;
}

export interface OrderResponse {
  id: number;
  date: Date;
  status: OrderStatus;
  orderedTotal: number;
  arrivalTotal: number;
  supplierId?: number;
  supplier?: { id: number; name: string };
  ordersDetails: OrderDetailResponse[];
}
