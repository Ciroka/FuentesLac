import { Component, OnInit, ChangeDetectorRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
  errorMessage = signal('');

  ngOnInit(): void {
    this.cargarTodo();
  }

  /**
   * Registrar una llegada cambia el stock de insumos y el estado del pedido,
   * así que las dos listas se recargan juntas desde acá. Cada rama tiene su
   * propio catchError: si una falla, la otra igual se muestra y se avisa
   * puntualmente qué parte no se pudo cargar, en vez de dejar todo en blanco.
   */
  cargarTodo(): void {
    let insumosConError = false;
    let pedidosConError = false;

    forkJoin({
      insumos: this.suppliesService.findAll().pipe(
        catchError((err) => {
          console.error('Error al cargar insumos:', err);
          insumosConError = true;
          return of<Supply[]>([]);
        })
      ),
      pedidos: this.ordersService.findAll().pipe(
        catchError((err) => {
          console.error('Error al cargar pedidos:', err);
          pedidosConError = true;
          return of<Order[]>([]);
        })
      ),
    }).subscribe(({ insumos, pedidos }) => {
      this.insumos.set(insumos);
      this.pedidos.set(pedidos);
      this.errorMessage.set(this.armarMensajeError(insumosConError, pedidosConError));
      this.cdr.detectChanges();
    });
  }

  private armarMensajeError(insumosConError: boolean, pedidosConError: boolean): string {
    if (insumosConError && pedidosConError) {
      return 'No se pudieron cargar los insumos ni los pedidos.';
    }
    if (insumosConError) {
      return 'No se pudieron cargar los insumos. Los pedidos se muestran igual.';
    }
    if (pedidosConError) {
      return 'No se pudieron cargar los pedidos. Los insumos se muestran igual.';
    }
    return '';
  }
}
