export interface SaleDetailResponse {
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

export interface SaleResponse {
  id: number;
  date: Date;
  total: number;
  clientId?: number;
  /** URL lista para mostrar la foto de la venta (firmada o pública). */
  photoUrl?: string | null;
  details?: SaleDetailResponse[];
}
