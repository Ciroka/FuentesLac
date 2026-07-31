import { Component, OnInit, inject, signal } from '@angular/core';
import { Navbar } from '../../shared/navbar/navbar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../services/products.service';
import { CategoriesService } from '../../services/categories.service';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    Navbar, CommonModule, FormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatIconModule,
    MatSelectModule, MatOptionModule, MatChipsModule, MatProgressBarModule,
    MatButtonModule
  ],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products implements OnInit {
  private productsService = inject(ProductsService);
  private categoriesService = inject(CategoriesService);

  readonly limit = 10;

  productos = signal<Product[]>([]);
  categorias: Category[] = [];
  page = signal(1);
  total = signal(0);
  searchTerm = '';
  selectedCategoryId: number | null = null;

  ngOnInit(): void {
    this.categoriesService.findAll(1000, 'products').subscribe(data => (this.categorias = data));
    this.loadProducts();
  }

  loadProducts(): void {
    this.productsService
      .findPageWithStock(this.page(), this.limit, this.searchTerm || undefined, this.selectedCategoryId)
      .subscribe({
        next: (res) => {
          this.productos.set(res.items);
          this.total.set(res.total);
        },
        error: (err) => console.error('Error al traer productos:', err)
      });
  }

  onFilterChange(): void {
    this.page.set(1);
    this.loadProducts();
  }

  nextPage(): void {
    if (this.page() * this.limit >= this.total()) return;
    this.page.update(p => p + 1);
    this.loadProducts();
  }

  prevPage(): void {
    if (this.page() <= 1) return;
    this.page.update(p => p - 1);
    this.loadProducts();
  }

  getStockPercent(producto: Product): number {
    const stock = producto.totalStock ?? 0;
    const min = producto.minStock || 1;
    return Math.min((stock / min) * 100, 100);
  }

  getEstado(producto: Product): { color: string; label: string; chipClass: string } {
    const stock = producto.totalStock ?? 0;
    const min = producto.minStock;

    if (min <= 0) {
      return { color: 'var(--color-success)', label: 'OK', chipClass: 'chip-ok' };
    }

    const ratio = stock / min;

    if (ratio < 1) {
      return { color: 'var(--color-danger)', label: 'CRÍTICO', chipClass: 'chip-danger' };
    } else if (ratio < 1.2) {
      return { color: 'var(--color-warning)', label: 'BAJO', chipClass: 'chip-warn' };
    } else {
      return { color: 'var(--color-success)', label: 'OK', chipClass: 'chip-ok' };
    }
  }
}
