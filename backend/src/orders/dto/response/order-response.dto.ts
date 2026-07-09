export interface OrderResponse {
  id: number;
  date: Date;
  total: number;
  supplierId?: number;
}
