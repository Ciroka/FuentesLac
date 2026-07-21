import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { Navbar } from '../../shared/navbar/navbar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../services/products.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [Navbar, CommonModule, FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products implements OnInit {
  private productsService = inject(ProductsService);
  private cdr = inject(ChangeDetectorRef);

  productos: Product[] = [];
  categorias: { id: number; name: string }[] = [];
  searchTerm = '';
  selectedCategoryId: number | null = null;

  ngOnInit(): void {
    this.productsService.findAllWithStock().subscribe({
      next: (data) => {
        this.productos = data;
        this.categorias = this.extraerCategorias(data);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al traer productos:', err)
    });
  }

  get filteredProducts(): Product[] {
    return this.productos.filter(product => {
      const matchName = !this.searchTerm ||
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchCategory = this.selectedCategoryId === null ||
        product.category?.id === this.selectedCategoryId;
      return matchName && matchCategory;
    });
  }

  extraerCategorias(productos: Product[]): { id: number; name: string }[] {
    const map = new Map<number, string>();
    productos.forEach(p => {
      if (p.category) map.set(p.category.id, p.category.name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }

  getStockPercent(producto: Product): number {
    const stock = producto.totalStock ?? 0;
    const min = producto.minStock || 1;
    return Math.min((stock / min) * 100, 100);
  }

  getEstado(producto: Product): { color: string; label: string; tagClass: string } {
    const stock = producto.totalStock ?? 0;
    const min = producto.minStock;

    if (min <= 0) {
      return { color: 'var(--green)', label: 'OK', tagClass: 'tag-ok' };
    }

    const ratio = stock / min;

    if (ratio < 1) {
      return { color: 'var(--wax)', label: 'CRÍTICO', tagClass: 'tag-danger' };
    } else if (ratio < 1.2) {
      return { color: 'var(--gold)', label: 'BAJO', tagClass: 'tag-warn' };
    } else {
      return { color: 'var(--green)', label: 'OK', tagClass: 'tag-ok' };
    }
  }
}
