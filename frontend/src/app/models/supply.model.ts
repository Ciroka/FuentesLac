export interface Supply {
  id: number;
  name: string;
  costPrice: number;
  currentStock: number;
  minStock: number;
  isMilk: boolean;
  category?: { id: number; name: string };
  supplier?: { id: number; name: string };
}