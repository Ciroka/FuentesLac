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
  clientId?: number;
  client?: { id: number; name: string; lastName: string };
  /** URL lista para mostrar la foto de la venta (una por venta). */
  photoUrl?: string | null;
  details?: SaleDetail[];
}

export interface CreateSaleDetailRequest {
  batchId: number;
  quantity: number;
  weight?: number;
}

export interface CreateSaleRequest {
  clientId?: number;
  details: CreateSaleDetailRequest[];
}
