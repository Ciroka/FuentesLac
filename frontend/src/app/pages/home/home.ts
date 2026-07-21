import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { Navbar } from '../../shared/navbar/navbar';
import { CommonModule } from '@angular/common';
import { DashboardService, DashboardData } from '../../services/dashboard.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Navbar, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomePage implements OnInit {
  private dashboardService = inject(DashboardService);
  private cdr = inject(ChangeDetectorRef);

  data: DashboardData | null = null;
  totalInsumos = 0;
  insumosBajoMinimo = 0;
  gastoInsumos = 0;
  totalProductos = 0;

  ngOnInit(): void {
    this.dashboardService.loadDashboard().subscribe({
      next: (data) => {
        this.data = data;
        this.totalInsumos = data.insumos.length;
        this.insumosBajoMinimo = data.insumosBajoMinimo;
        this.gastoInsumos = data.gastoInsumos;
        this.totalProductos = data.productos.length;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar dashboard:', err)
    });
  }

  formatCurrency(value: number): string {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    }
    return `$${value.toLocaleString('es-AR')}`;
  }
}
