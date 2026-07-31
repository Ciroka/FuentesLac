import { Component, OnInit, inject, signal } from '@angular/core';
import { Navbar } from '../shared/navbar/navbar';
import { DashboardService } from '../services/dashboard.service';
import { DashboardSummary } from '../models/dashboard.model';
import { KpiCard } from './components/kpi-card/kpi-card';
import { ActionList } from './components/action-list/action-list';
import { WeeklyChart } from './components/weekly-chart/weekly-chart';
import { ProductStockBars } from './components/product-stock-bars/product-stock-bars';
import { TopSellingList } from './components/top-selling-list/top-selling-list';
import { MatCardModule, MatCardContent } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    Navbar, KpiCard, ActionList, WeeklyChart, ProductStockBars, TopSellingList,
    MatCardModule, MatCardContent, MatButtonModule, MatProgressSpinnerModule, MatIconModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  summary = signal<DashboardSummary | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.dashboardService.getSummary().subscribe({
      next: (data) => {
        this.summary.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar el resumen del día');
        this.loading.set(false);
      },
    });
  }

  formatCurrency(value: number): string {
    return `$${value.toLocaleString('es-AR')}`;
  }
}
