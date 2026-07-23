export interface ProductStock {
  id: number;
  name: string;
  totalStock: number;
  minStock: number;
  category?: string;
  status: 'ok' | 'warn' | 'critical';
}
