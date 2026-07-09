export interface AdjustmentResponse {
  id: number;
  stockChange: number;
  adjustmentType: string;
  date: Date;
  productId?: number;
}
