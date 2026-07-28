import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalesService } from '../../services/sales.service';
import { SalesDetailService } from '../../services/sales-detail.service';
import { Sale, SaleDetail } from '../../models/sale.model';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [
    Navbar, CommonModule, FormsModule, RouterLink,
    MatTableModule, MatFormFieldModule, MatInputModule, MatIconModule,
    MatButtonModule, MatProgressSpinnerModule, MatCardModule, MatTooltipModule
  ],
  templateUrl: './sales.html',
  styleUrl: './sales.scss',
})
export class Sales implements OnInit {
  private salesService = inject(SalesService);
  private salesDetailService = inject(SalesDetailService);
  private cdr = inject(ChangeDetectorRef);

  ventas: Sale[] = [];
  searchTerm = '';
  expandedIds = new Set<number>();
  loadingDetailId: number | null = null;
  displayedColumns = ['toggle', 'id', 'date', 'client', 'total'];
  displayedDetailColumns = ['product', 'quantity', 'unitPrice', 'subtotal', 'weight'];

  ngOnInit(): void {
    this.salesService.findAll().subscribe({
      next: (data) => {
        this.ventas = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al traer ventas:', err)
    });
  }

  get filteredVentas(): Sale[] {
    if (!this.searchTerm) return this.ventas;
    const term = this.searchTerm.toLowerCase();
    return this.ventas.filter(venta => {
      const cliente = venta.client;
      return cliente
        ? `${cliente.name} ${cliente.lastName}`.toLowerCase().includes(term)
        : false;
    });
  }

  toggleDetail(venta: Sale): void {
    if (this.expandedIds.has(venta.id)) {
      this.expandedIds.delete(venta.id);
      return;
    }

    if (venta.details?.length) {
      this.expandedIds.add(venta.id);
      this.cdr.detectChanges();
      return;
    }

    this.loadingDetailId = venta.id;
    this.salesDetailService.findBySaleId(venta.id).subscribe({
      next: (details) => {
        venta.details = details;
        this.expandedIds.add(venta.id);
        this.loadingDetailId = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al traer detalles de venta:', err);
        this.loadingDetailId = null;
        this.cdr.detectChanges();
      }
    });
  }

  isExpanded(id: number): boolean {
    return this.expandedIds.has(id);
  }

  isLoadingDetail(id: number): boolean {
    return this.loadingDetailId === id;
  }

  getCliente(venta: Sale): string {
    if (venta.client) {
      return `${venta.client.name} ${venta.client.lastName}`;
    }
    return '—';
  }

  getProductName(detail: SaleDetail): string {
    return detail.batch?.product?.name ?? '—';
  }
}
