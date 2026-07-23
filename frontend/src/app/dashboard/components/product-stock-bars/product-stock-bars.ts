import { Component, input } from '@angular/core';
import { ProductStock } from '../../../models/dashboard.model';

@Component({
  selector: 'app-product-stock-bars',
  standalone: true,
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
}
