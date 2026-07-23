import { Component, input } from '@angular/core';

@Component({
  selector: 'app-top-selling-list',
  standalone: true,
  templateUrl: './top-selling-list.html',
  styleUrl: './top-selling-list.scss',
})
export class TopSellingList {
  products = input.required<{ productName: string; quantity: number; amount: number }[]>();

  formatCurrency(value: number): string {
    return `$${value.toLocaleString('es-AR')}`;
  }
}
