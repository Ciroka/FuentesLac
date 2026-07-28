import { Component, OnInit, ChangeDetectorRef, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { OrdersService } from '../../services/orders.service';
import { SuppliersService } from '../../services/suppliers.service';
import { SuppliesService } from '../../services/supplies.service';
import { Supplier } from '../../models/supplier.model';
import { Supply } from '../../models/supply.model';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface OrderLineRow {
  supplyId: number | null;
  quantity: number | null;
}

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [
    Navbar, CommonModule, FormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule, MatIconModule,
    MatSelectModule, MatOptionModule, MatButtonModule, MatProgressSpinnerModule,
  ],
  templateUrl: './order-form.html',
  styleUrl: './order-form.scss',
})
export class OrderForm implements OnInit {
  private ordersService = inject(OrdersService);
  private suppliersService = inject(SuppliersService);
  private suppliesService = inject(SuppliesService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  suppliers: Supplier[] = [];
  supplies: Supply[] = [];

  supplierId: number | null = null;
  lines: OrderLineRow[] = [this.emptyLine()];

  submitting = signal(false);
  errorMessage = signal('');

  ngOnInit(): void {
    forkJoin({
      suppliers: this.suppliersService.findAll(),
      supplies: this.suppliesService.findAll(),
    }).subscribe({
      next: ({ suppliers, supplies }) => {
        this.suppliers = suppliers;
        this.supplies = supplies;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar datos para el pedido:', err)
    });
  }

  private emptyLine(): OrderLineRow {
    return { supplyId: null, quantity: null };
  }

  addLine(): void {
    this.lines.push(this.emptyLine());
  }

  removeLine(index: number): void {
    if (this.lines.length === 1) return;
    this.lines.splice(index, 1);
  }

  get suppliesForSupplier(): Supply[] {
    if (!this.supplierId) return this.supplies;
    const matching = this.supplies.filter(s => s.supplier?.id === this.supplierId);
    return matching.length ? matching : this.supplies;
  }

  getSupply(supplyId: number | null): Supply | undefined {
    if (!supplyId) return undefined;
    return this.supplies.find(s => s.id === supplyId);
  }

  rowSubtotal(row: OrderLineRow): number {
    const supply = this.getSupply(row.supplyId);
    if (!supply || !row.quantity) return 0;
    return supply.costPrice * row.quantity;
  }

  get total(): number {
    return this.lines.reduce((sum, row) => sum + this.rowSubtotal(row), 0);
  }

  isValid(): boolean {
    if (!this.supplierId) return false;
    if (this.lines.length === 0) return false;
    return this.lines.every(row => !!row.supplyId && !!row.quantity && row.quantity > 0);
  }

  submit(): void {
    if (!this.isValid() || this.submitting()) return;

    this.submitting.set(true);
    this.errorMessage.set('');

    this.ordersService.create({
      supplierId: this.supplierId!,
      details: this.lines.map(row => ({
        supplyId: row.supplyId!,
        quantity: row.quantity!,
      })),
    }).subscribe({
      next: () => this.router.navigate(['/supplies']),
      error: (err) => this.handleError(err)
    });
  }

  private handleError(err: { error?: { message?: string } }): void {
    this.submitting.set(false);
    this.errorMessage.set(err?.error?.message ?? 'Ocurrió un error al registrar el pedido.');
    this.cdr.detectChanges();
  }

  formatCurrency(value: number): string {
    return `$${value.toLocaleString('es-AR')}`;
  }
}
