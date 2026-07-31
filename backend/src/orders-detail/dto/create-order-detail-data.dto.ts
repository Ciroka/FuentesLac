import { Supply } from 'src/supplies';

// Este NO es un DTO validado con class-validator, es un tipo interno
export interface CreateOrderDetailData {
  orderId: number;
  supply: Supply;
  orderedQuantity: number;
  subtotal: number;
}
