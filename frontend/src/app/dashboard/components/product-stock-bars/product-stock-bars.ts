import { Component, input } from '@angular/core';
import { ProductStock } from '../../../models/dashboard.model';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-stock-bars',
  standalone: true,
  imports: [CommonModule, MatListModule, MatChipsModule],
  templateUrl: './product-stock-bars.html',
  styleUrl: './product-stock-bars.scss',
})
export class ProductStockBars {
  products = input.required<ProductStock[]>();

  barWidth(product: ProductStock): number {
    if (product.minStock <= 0) return 100;
    const ratio = product.totalStock / product.minStock;
    return Math.min((ratio / 3) * 100, 100);
  }

  minMarkerPercent(): number {
    return (1 / 3) * 100;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ok': return 'chip-ok';
      case 'warn': return 'chip-warn';
      case 'critical': return 'chip-danger';
      default: return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'warn': return 'AJUSTADO';
      case 'critical': return 'BAJO';
      default: return '';
    }
  }
}
