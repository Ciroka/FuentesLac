export interface OrdersDetailResponse {
  id: number;
  orderedQuantity: number;
  arrivalQuantity: number;
  subtotal: number;
  orderId?: number;
  productId?: number;
}
