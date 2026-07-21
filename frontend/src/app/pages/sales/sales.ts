import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { Navbar } from '../../shared/navbar/navbar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalesService } from '../../services/sales.service';
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
  private cdr = inject(ChangeDetectorRef);

  ventas: Sale[] = [];
  searchTerm = '';

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
}
