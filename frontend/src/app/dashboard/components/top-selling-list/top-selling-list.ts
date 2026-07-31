import { Component, input } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-top-selling-list',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule],
  templateUrl: './top-selling-list.html',
  styleUrl: './top-selling-list.scss',
})
export class TopSellingList {
  products = input.required<{ productName: string; quantity: number; amount: number }[]>();

  formatCurrency(value: number): string {
    return `$${value.toLocaleString('es-AR')}`;
  }
}
