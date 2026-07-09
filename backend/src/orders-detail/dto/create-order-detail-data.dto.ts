import { Product } from 'src/products';

// Este NO es un DTO validado con class-validator, es un tipo interno
export interface CreateOrderDetailData {
  orderId: number;
  product: Product;
  orderedQuantity: number;
  subtotal: number;
}
