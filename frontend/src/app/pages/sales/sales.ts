import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { Navbar } from '../../shared/navbar/navbar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalesService } from '../../services/sales.service';
import { SalesDetailService } from '../../services/sales-detail.service';
import { Sale } from '../../models/sale.model';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [Navbar, CommonModule, FormsModule],
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
      const matchCliente = cliente
        ? `${cliente.name} ${cliente.lastName}`.toLowerCase().includes(term)
        : false;
      const matchMetodo = venta.paymentMethod.toLowerCase().includes(term);
      return matchCliente || matchMetodo;
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

  getMetodoPago(method: string): string {
    const map: Record<string, string> = {
      'EFECTIVO': 'Efectivo',
      'TRANSFERENCIA': 'Transferencia',
      'QR': 'QR',
      'TARJETA_DEBITO': 'Débito',
      'TARJETA_CREDITO': 'Crédito',
    };
    return map[method] || method;
  }

  getCliente(venta: Sale): string {
    if (venta.client) {
      return `${venta.client.name} ${venta.client.lastName}`;
    }
    return '—';
  }

  getProductName(detail: any): string {
    return detail.batch?.product?.name ?? '—';
  }
}
