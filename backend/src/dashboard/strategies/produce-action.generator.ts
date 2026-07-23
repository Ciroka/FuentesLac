import { Injectable } from '@nestjs/common';
import { ActionGenerator, DashboardContext } from './action-generator.interface';
import { DashboardAction } from '../dto/response/dashboard-action.dto';

@Injectable()
export class ProduceActionGenerator implements ActionGenerator {
  generate(ctx: DashboardContext): DashboardAction[] {
    return ctx.products
      .filter(p => p.totalStock < p.minStock)
      .sort((a, b) => (a.totalStock / a.minStock) - (b.totalStock / b.minStock))
      .map(p => {
        const missing = p.minStock - p.totalStock;
        const missingPercent = Math.round((missing / p.minStock) * 100);
        const priority: DashboardAction['priority'] =
          missingPercent > 50 ? 'high' : missingPercent >= 20 ? 'medium' : 'low';
        return {
          type: 'produce' as const,
          priority,
          label: `Producir ${p.name} ${missing} u`,
          detail: `stock: ${p.totalStock}, mín: ${p.minStock}`,
          missingPercent,
        };
      });
  }
}
