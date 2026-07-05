import { CategoryResponse } from 'src/categories/dto/category-response.dto';

export interface ProductsResponse {
  id: number;
  name: string;
  price: number;
  stock: number;
  categoryId?: number | null;
  category?: CategoryResponse;
}
