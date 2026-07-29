import { Component, ChangeDetectorRef, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { OrdersService } from '../../../../services/orders.service';
import { Order, OrderStatus, RegisterArrivalRequest } from '../../../../models/order.model';

interface CantidadLlegada {
  supplyId: number;
  supplyName: string;
  orderedQuantity: number;
  quantity: number | null;
}

@Component({
  selector: 'app-order-card',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule
  ],
  templateUrl: './order-card.html',
  styleUrl: './order-card.scss',
})
export class OrderCard {
  private ordersService = inject(OrdersService);
  private cdr = inject(ChangeDetectorRef);

  order = input.required<Order>();
  changed = output<void>();

  modo = signal<'ver' | 'llegada' | 'cancelar'>('ver');
  guardando = signal(false);
  errorMessage = signal('');

  cantidades: CantidadLlegada[] = [];

  get esPendiente(): boolean {
    return this.order().status === OrderStatus.PENDING;
  }

  /**
   * El template no puede comparar contra el enum directamente: con
   * strictTemplates activo (`frontend/tsconfig.json`), `status === 'RECEIVED'`
   * es un error de tipos.
   */
  get esRecibido(): boolean {
    return this.order().status === OrderStatus.RECEIVED;
  }

  get estadoChip(): { label: string; chipClass: string } {
    switch (this.order().status) {
      case OrderStatus.RECEIVED:
        return { label: 'Recibido', chipClass: 'chip-ok' };
      case OrderStatus.CANCELLED:
        return { label: 'Cancelado', chipClass: 'chip-muted' };
      default:
        return { label: 'Pendiente', chipClass: 'chip-warn' };
    }
  }

  /** Los campos arrancan vacíos: se cargan contra el remito. */
  abrirLlegada(): void {
    this.cantidades = (this.order().ordersDetails ?? []).map(detail => ({
      supplyId: detail.supply?.id ?? 0,
      supplyName: detail.supply?.name ?? '',
      orderedQuantity: detail.orderedQuantity,
      quantity: null,
    }));
    this.errorMessage.set('');
    this.modo.set('llegada');
  }

  cerrar(): void {
    this.modo.set('ver');
    this.errorMessage.set('');
  }

  get llegadaValida(): boolean {
    return this.cantidades.some(c => (c.quantity ?? 0) > 0);
  }

  armarPedidoDeLlegada(): RegisterArrivalRequest {
    return {
      details: this.cantidades.map(c => ({
        supplyId: c.supplyId,
        quantity: c.quantity ?? 0,
      })),
    };
  }

  confirmarLlegada(): void {
    if (!this.llegadaValida || this.guardando()) return;

    this.guardando.set(true);
    this.errorMessage.set('');

    this.ordersService.registerArrival(this.order().id, this.armarPedidoDeLlegada()).subscribe({
      next: () => this.onExito(),
      error: (err) => this.onError(err)
    });
  }

  pedirCancelacion(): void {
    this.errorMessage.set('');
    this.modo.set('cancelar');
  }

  confirmarCancelacion(): void {
    if (this.guardando()) return;

    this.guardando.set(true);
    this.errorMessage.set('');

    this.ordersService.cancel(this.order().id).subscribe({
      next: () => this.onExito(),
      error: (err) => this.onError(err)
    });
  }

  private onExito(): void {
    this.guardando.set(false);
    this.modo.set('ver');
    this.changed.emit();
  }

  /**
   * Un 409 significa que el pedido ya fue registrado o cancelado desde otra
   * sesión: además del mensaje se recarga la lista para reflejar la realidad.
   */
  private onError(err: { status?: number; error?: { message?: string } }): void {
    this.guardando.set(false);

    if (err?.status === 409) {
      this.errorMessage.set('Este pedido ya fue registrado o cancelado.');
      this.modo.set('ver');
      this.changed.emit();
    } else {
      this.errorMessage.set(err?.error?.message ?? 'Ocurrió un error al actualizar el pedido.');
    }

    this.cdr.detectChanges();
  }
}
