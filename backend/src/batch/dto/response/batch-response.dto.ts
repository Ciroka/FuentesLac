import { Batch } from '../../entities/batch.entity';

export interface BatchResponse {
  id: number;
  yield?: number;
  description?: string;
  currentStock: number;
  milkLitersUsed?: number;
  obtainedWeight?: number;
  clientBatchDate?: Date;
  clientBatchCode?: string;
  productId: number;
}

export function toBatchResponse(batch: Batch): BatchResponse {
  return {
    id: batch.id,
    yield: batch.yield,
    description: batch.description,
    currentStock: batch.currentStock,
    milkLitersUsed: batch.milkLitersUsed,
    obtainedWeight: batch.obtainedWeight,
    clientBatchDate: batch.clientBatchDate,
    clientBatchCode: batch.clientBatchDate
      ? formatClientBatchCode(batch.clientBatchDate)
      : undefined,
    productId: batch.productId,
  };
}

function formatClientBatchCode(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}
