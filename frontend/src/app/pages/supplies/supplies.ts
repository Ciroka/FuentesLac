import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../shared/navbar/navbar';
import { CommonModule } from '@angular/common';
import { SuppliesService } from '../../services/supplies.service';
import { OrdersService } from '../../services/orders.service';
import { CategoriesService } from '../../services/categories.service';
import { Supply } from '../../models/supply.model';
import { Order } from '../../models/order.model';
import { Category } from '../../models/category.model';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { SuppliesTable } from './components/supplies-table/supplies-table';
import { OrdersList } from './components/orders-list/orders-list';

@Component({
  selector: 'app-supplies',
  standalone: true,
  imports: [
    Navbar, CommonModule, FormsModule, RouterLink,
    MatTabsModule, MatIconModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatOptionModule,
    SuppliesTable, OrdersList
  ],
  templateUrl: './supplies.html',
  styleUrl: './supplies.scss',
})
export class Supplies implements OnInit {
  private suppliesService = inject(SuppliesService);
  private ordersService = inject(OrdersService);
  private categoriesService = inject(CategoriesService);

  readonly limit = 10;

  insumos = signal<Supply[]>([]);
  insumosTotal = signal(0);
  insumosPage = signal(1);
  categorias: Category[] = [];
  searchTerm = '';
  selectedCategoryId: number | null = null;

  pedidos = signal<Order[]>([]);
  pedidosTotal = signal(0);
  pedidosPage = signal(1);

  insumosError = signal(false);
  pedidosError = signal(false);

  get errorMessage(): string {
    if (this.insumosError() && this.pedidosError()) {
      return 'No se pudieron cargar los insumos ni los pedidos.';
    }
    if (this.insumosError()) {
      return 'No se pudieron cargar los insumos. Los pedidos se muestran igual.';
    }
    if (this.pedidosError()) {
      return 'No se pudieron cargar los pedidos. Los insumos se muestran igual.';
    }
    return '';
  }

  ngOnInit(): void {
    this.categoriesService.findAll(1000, 'supplies').subscribe(data => (this.categorias = data));
    this.cargarTodo();
  }

  /** Registrar una llegada cambia el stock de insumos y el estado del pedido, así que las dos listas se recargan juntas desde acá. */
  cargarTodo(): void {
    this.loadInsumos();
    this.loadPedidos();
  }

  loadInsumos(): void {
    this.suppliesService
      .findPage(this.insumosPage(), this.limit, this.searchTerm || undefined, this.selectedCategoryId)
      .subscribe({
        next: (res) => {
          this.insumos.set(res.items);
          this.insumosTotal.set(res.total);
          this.insumosError.set(false);
        },
        error: (err) => {
          console.error('Error al cargar insumos:', err);
          this.insumosError.set(true);
        }
      });
  }

  loadPedidos(): void {
    this.ordersService.findPage(this.pedidosPage(), this.limit).subscribe({
      next: (res) => {
        this.pedidos.set(res.items);
        this.pedidosTotal.set(res.total);
        this.pedidosError.set(false);
      },
      error: (err) => {
        console.error('Error al cargar pedidos:', err);
        this.pedidosError.set(true);
      }
    });
  }

  onFilterChange(): void {
    this.insumosPage.set(1);
    this.loadInsumos();
  }

  nextInsumosPage(): void {
    if (this.insumosPage() * this.limit >= this.insumosTotal()) return;
    this.insumosPage.update(p => p + 1);
    this.loadInsumos();
  }

  prevInsumosPage(): void {
    if (this.insumosPage() <= 1) return;
    this.insumosPage.update(p => p - 1);
    this.loadInsumos();
  }

  nextPedidosPage(): void {
    if (this.pedidosPage() * this.limit >= this.pedidosTotal()) return;
    this.pedidosPage.update(p => p + 1);
    this.loadPedidos();
  }

  prevPedidosPage(): void {
    if (this.pedidosPage() <= 1) return;
    this.pedidosPage.update(p => p - 1);
    this.loadPedidos();
  }
}
