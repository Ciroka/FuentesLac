export interface OrdersDetailResponse {
  id: number;
  orderedQuantity: number;
  arrivalQuantity: number;
  orderedSubtotal: number;
  arrivalSubtotal: number;
  orderId?: number;
  supplyId?: number;
}