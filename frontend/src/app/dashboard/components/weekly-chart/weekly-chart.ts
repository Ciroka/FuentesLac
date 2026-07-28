import { Component, input, computed } from '@angular/core';
import { WeeklyDay } from '../../../models/dashboard.model';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-weekly-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, MatIconModule],
  templateUrl: './weekly-chart.html',
  styleUrl: './weekly-chart.scss',
})
export class WeeklyChart {
  days = input.required<WeeklyDay[]>();

  chartData = computed<ChartData<'bar'>>(() => ({
    labels: this.days().map(d => this.dayLabel(d.date)),
    datasets: [{
      data: this.days().map(d => d.total),
      backgroundColor: this.days().map(d =>
        this.isToday(d.date) ? '#2f6690' : '#a8b6c2'
      ),
      borderRadius: 6,
      borderSkipped: false,
      barPercentage: 0.6,
    }]
  }));

  chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: { left: 8, right: 16, top: 8, bottom: 0 },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1c2733',
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
          color: '#64748b',
          stepSize: 1,
        }
      },
      x: {
        offset: true,
        grid: { display: false },
        ticks: {
          font: { family: 'Inter', size: 10 },
          color: '#64748b',
        }
      }
    }
  };

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
