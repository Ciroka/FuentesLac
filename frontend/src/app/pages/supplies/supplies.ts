import { Component, OnInit, ChangeDetectorRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Navbar } from '../../shared/navbar/navbar';
import { CommonModule } from '@angular/common';
import { SuppliesService } from '../../services/supplies.service';
import { OrdersService } from '../../services/orders.service';
import { Supply } from '../../models/supply.model';
import { Order } from '../../models/order.model';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SuppliesTable } from './components/supplies-table/supplies-table';
import { OrdersList } from './components/orders-list/orders-list';

@Component({
  selector: 'app-supplies',
  standalone: true,
  imports: [
    Navbar, CommonModule, RouterLink,
    MatTabsModule, MatIconModule, MatButtonModule,
    SuppliesTable, OrdersList
  ],
  templateUrl: './supplies.html',
  styleUrl: './supplies.scss',
})
export class Supplies implements OnInit {
  private suppliesService = inject(SuppliesService);
  private ordersService = inject(OrdersService);
  private cdr = inject(ChangeDetectorRef);

  insumos = signal<Supply[]>([]);
  pedidos = signal<Order[]>([]);

  ngOnInit(): void {
    this.cargarTodo();
  }

  /**
   * Registrar una llegada cambia el stock de insumos y el estado del pedido,
   * así que las dos listas se recargan juntas desde acá.
   */
  cargarTodo(): void {
    forkJoin({
      insumos: this.suppliesService.findAll(),
      pedidos: this.ordersService.findAll(),
    }).subscribe({
      next: ({ insumos, pedidos }) => {
        this.insumos.set(insumos);
        this.pedidos.set(pedidos);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar insumos y pedidos:', err)
    });
  }
}
