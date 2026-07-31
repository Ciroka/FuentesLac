export interface ProductBreakdown {
  productName: string;
  quantity: number;
}

export interface WeeklyDay {
  date: string;
  total: number;
  products: ProductBreakdown[];
}
