import { DashboardAction } from '../dto/response/dashboard-action.dto';
import { ProductStock } from '../dto/response/product-stock.dto';
import { CriticalSupply } from '../dto/response/dashboard-summary.dto';

export interface DashboardContext {
  products: ProductStock[];
  supplies: {
    id: number;
    name: string;
    currentStock: number;
    minStock: number;
    supplier?: { name: string };
  }[];
  criticalSupplies: CriticalSupply[];
}

export interface ActionGenerator {
  generate(context: DashboardContext): DashboardAction[];
}
