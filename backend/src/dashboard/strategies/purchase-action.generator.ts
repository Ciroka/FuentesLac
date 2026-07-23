import { Injectable } from '@nestjs/common';
import { ActionGenerator, DashboardContext } from './action-generator.interface';
import { DashboardAction } from '../dto/response/dashboard-action.dto';

@Injectable()
export class PurchaseActionGenerator implements ActionGenerator {
  generate(ctx: DashboardContext): DashboardAction[] {
    return ctx.criticalSupplies
      .sort((a, b) => (a.currentStock / a.minStock) - (b.currentStock / b.minStock))
      .map(s => {
        const missing = s.minStock - s.currentStock;
        const missingPercent = Math.round((missing / s.minStock) * 100);
        const priority: DashboardAction['priority'] =
          missingPercent > 50 ? 'high' : missingPercent >= 20 ? 'medium' : 'low';
        return {
          type: 'purchase' as const,
          priority,
          label: `Comprar ${s.name} (+${missing})`,
          detail: `${s.currentStock} / ${s.minStock}${s.supplierName ? ` — ${s.supplierName}` : ''}`,
          missingPercent,
        };
      });
  }
}
