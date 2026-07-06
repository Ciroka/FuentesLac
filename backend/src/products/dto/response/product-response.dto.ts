import { CategoryResponse } from '../../../categories/dto';

export interface ProductResponse {
  id: number;
  name: string;
  salePrice: number;
  costPrice: number;
  marginPercent: number;
  currentStock: number;
  minStock: number;
  categoryId?: number;
  category?: CategoryResponse;
}
