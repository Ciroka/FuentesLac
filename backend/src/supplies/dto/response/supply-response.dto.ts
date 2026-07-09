export interface SupplyResponse {
  id: number;
  name: string;
  costPrice: number;
  currentStock: number;
  minStock: number;
  supplierId?: number;
  categoryId?: number;
}
