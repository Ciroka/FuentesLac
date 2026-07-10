export interface OrderResponse {
  id: number;
  date: Date;
  orderedTotal: number;
  arrivalTotal: number;
  supplierId?: number;
}
