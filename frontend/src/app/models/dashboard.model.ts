export interface DashboardAction {
  type: 'produce' | 'purchase';
  priority: 'high' | 'medium' | 'low';
  label: string;
  detail: string;
  missingPercent: number;
}

export interface ProductStock {
  id: number;
  name: string;
  totalStock: number;
  minStock: number;
  category?: string;
  status: 'ok' | 'warn' | 'critical';
}

export interface CriticalSupply {
  id: number;
  name: string;
  currentStock: number;
  minStock: number;
  supplierName?: string;
}

export interface TodayProduction {
  totalQuantity: number;
  vsYesterday: number;
  breakdown: { productName: string; quantity: number }[];
}

export interface TodaySales {
  totalAmount: number;
  totalUnits: number;
  vsYesterday: number;
  topProducts: { productName: string; quantity: number; amount: number }[];
}

export interface ProductionVsSales {
  produced: number;
  sold: number;
  balance: number;
}

export interface ProductBreakdown {
  productName: string;
  quantity: number;
}

export interface WeeklyDay {
  date: string;
  total: number;
  products: ProductBreakdown[];
}

export interface DashboardSummary {
  todayProduction: TodayProduction;
  todaySales: TodaySales;
  criticalSupplies: CriticalSupply[];
  lowestStockProduct: ProductStock | null;
  productionVsSales: ProductionVsSales;
  suggestedActions: DashboardAction[];
  productStocks: ProductStock[];
  weeklyProduction: WeeklyDay[];
}
