import { Component, input, computed } from '@angular/core';
import { WeeklyDay } from '../../../models/dashboard.model';

@Component({
  selector: 'app-weekly-chart',
  standalone: true,
  templateUrl: './weekly-chart.html',
  styleUrl: './weekly-chart.scss',
})
export class WeeklyChart {
  days = input.required<WeeklyDay[]>();

  maxTotal = computed(() => {
    const max = Math.max(...this.days().map(d => d.total));
    return max === 0 ? 1 : max;
  });

  yScale = computed(() => {
    const max = this.maxTotal();
    const step = this.niceStep(max);
    const ticks: number[] = [];
    for (let v = 0; v <= max + step * 0.5; v += step) {
      ticks.push(v);
    }
    return ticks;
  });

  barHeight(day: WeeklyDay): number {
    return (day.total / this.maxTotal()) * 100;
  }

  isToday(dateStr: string): boolean {
    const today = new Date();
    const d = new Date(dateStr + 'T00:00:00');
    return d.getFullYear() === today.getFullYear()
      && d.getMonth() === today.getMonth()
      && d.getDate() === today.getDate();
  }

  isEmpty(): boolean {
    return this.days().every(d => d.total === 0);
  }

  dayLabel(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-AR', { weekday: 'short' });
  }

  dayNumber(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.getDate().toString();
  }

  tooltipText(day: WeeklyDay): string {
    const parts = day.products.map(p => `${p.productName}: ${p.quantity}`).join(', ');
    return `${day.total} unidades\n${parts || 'Sin producción'}`;
  }

  private niceStep(max: number): number {
    if (max <= 5) return 1;
    if (max <= 20) return 5;
    if (max <= 50) return 10;
    if (max <= 200) return 50;
    if (max <= 1000) return 100;
    return Math.ceil(max / 5 / 100) * 100;
  }
}
