export interface Batch {
  id: number;
  yield?: number;
  description?: string;
  currentStock: number;
  milkLitersUsed?: number;
  obtainedWeight?: number;
  clientBatchDate?: string;
  clientBatchCode?: string;
  productId: number;
  product?: { id: number; name: string };
}
