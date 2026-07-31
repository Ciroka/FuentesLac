export interface Product {
  id: number;
  name: string;
  salePrice: number;
  costPrice: number;
  marginPercent: number;
  minStock: number;
  category?: { id: number; name: string };
  suppliers?: { id: number; name: string }[];
  totalStock?: number;
  isLowStock?: boolean;
}
