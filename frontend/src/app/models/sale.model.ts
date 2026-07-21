export interface Sale {
  id: number;
  date: Date;
  total: number;
  paymentMethod: string;
  clientId?: number;
  client?: { id: number; name: string; lastName: string };
}
