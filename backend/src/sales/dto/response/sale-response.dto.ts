export interface SaleResponse {
  id: number;
  date: Date;
  total: number;
  paymentMethod: string;
  clientId?: number;
}
