import { Component, input, computed, inject } from '@angular/core';
import { WeeklyDay } from '../../../models/dashboard.model';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../services/theme.service';

interface ChartPalette {
  today: string;
  other: string;
  tooltipBg: string;
  tick: string;
}

@Component({
  selector: 'app-weekly-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, MatIconModule],
  templateUrl: './weekly-chart.html',
  styleUrl: './weekly-chart.scss',
})
export class WeeklyChart {
  private readonly themeService = inject(ThemeService);

  days = input.required<WeeklyDay[]>();

  private palette = computed<ChartPalette>(() => {
    const dark = this.themeService.theme() === 'dark';
    return {
      today: dark ? '#5a9ec9' : '#2f6690',
      other: dark ? '#3a434c' : '#a8b6c2',
      tooltipBg: dark ? '#24292e' : '#1c2733',
      tick: dark ? '#929ba5' : '#64748b',
    };
  });

  chartData = computed<ChartData<'bar'>>(() => {
    const palette = this.palette();
    return {
      labels: this.days().map(d => this.dayLabel(d.date)),
      datasets: [{
        data: this.days().map(d => d.total),
        backgroundColor: this.days().map(d =>
          this.isToday(d.date) ? palette.today : palette.other
        ),
        borderRadius: 6,
        borderSkipped: false,
        barPercentage: 0.6,
      }]
    };
  });

  chartOptions = computed<ChartConfiguration<'bar'>['options']>(() => {
    const palette = this.palette();
    return {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: { left: 8, right: 16, top: 8, bottom: 0 },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: palette.tooltipBg,
          titleFont: { family: 'Inter' },
          bodyFont: { family: 'Inter', size: 11 },
          cornerRadius: 8,
          padding: 10,
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: {
            font: { family: 'Inter', size: 10 },
            color: palette.tick,
            stepSize: 1,
          }
        },
        x: {
          offset: true,
          grid: { display: false },
          ticks: {
            font: { family: 'Inter', size: 10 },
            color: palette.tick,
          }
        }
      }
    };
  });

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
}
