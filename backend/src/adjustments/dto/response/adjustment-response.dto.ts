import { AdjustmentType } from 'src/shared/enums';

export interface AdjustmentResponse {
  id: number;
  stockChange: number;
  adjustmentType: AdjustmentType;
  date: Date;
  productId?: number;
}
