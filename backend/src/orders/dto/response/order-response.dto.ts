export interface OrderResponse {
  id: number;
  date: Date;
  orderedTotal: number;
  arrival_total: number;
  supplierId?: number;
}
