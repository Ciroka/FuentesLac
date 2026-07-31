import { Injectable } from '@nestjs/common';
import {
  ActionGenerator,
  DashboardContext,
} from './action-generator.interface';
import { DashboardAction } from '../dto/response/dashboard-action.dto';

@Injectable()
export class CompositeActionGenerator implements ActionGenerator {
  constructor(private readonly generators: ActionGenerator[]) {}

  generate(context: DashboardContext): DashboardAction[] {
    return this.generators
      .flatMap((g) => g.generate(context))
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  }
}
