export interface SaleDetail {
  id: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  weight?: number;
  batch?: {
    id: number;
    product?: {
      id: number;
      name: string;
      salePrice: number;
    };
  };
}

export interface Sale {
  id: number;
  date: Date;
  total: number;
  paymentMethod: string;
  clientId?: number;
  client?: { id: number; name: string; lastName: string };
  details?: SaleDetail[];
}
