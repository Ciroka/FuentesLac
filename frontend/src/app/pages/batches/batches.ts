import { Component, OnInit, ChangeDetectorRef, inject, signal } from '@angular/core';
import { Navbar } from '../../shared/navbar/navbar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BatchService } from '../../services/batch.service';
import { ProductsService } from '../../services/products.service';
import { Batch } from '../../models/batch.model';
import { Product } from '../../models/product.model';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-batches',
  standalone: true,
  imports: [
    Navbar, CommonModule, FormsModule,
    MatTableModule, MatFormFieldModule, MatSelectModule, MatOptionModule,
    MatIconModule, MatButtonModule, MatTooltipModule,
  ],
  templateUrl: './batches.html',
  styleUrl: './batches.scss',
})
export class Batches implements OnInit {
  private batchService = inject(BatchService);
  private productsService = inject(ProductsService);
  private cdr = inject(ChangeDetectorRef);

  readonly limit = 10;

  lotes: Batch[] = [];
  products: Product[] = [];
  page = signal(1);
  total = signal(0);
  selectedProductId: number | null = null;
  sortOrder: 'ASC' | 'DESC' = 'DESC';

  private expandedIds = new Set<number>();

  displayedColumns = ['toggle', 'product', 'clientBatchCode', 'yield', 'currentStock'];

  ngOnInit(): void {
    this.productsService.findAll().subscribe(products => {
      this.products = products;
      this.cdr.detectChanges();
    });
    this.loadLotes();
  }

  loadLotes(): void {
    this.batchService
      .findPage(this.page(), this.limit, {
        productId: this.selectedProductId,
        sortBy: 'yield',
        order: this.sortOrder,
      })
      .subscribe({
        next: (res) => {
          this.lotes = res.items;
          this.total.set(res.total);
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error al traer lotes:', err)
      });
  }

  onFilterChange(): void {
    this.page.set(1);
    this.loadLotes();
  }

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'DESC' ? 'ASC' : 'DESC';
    this.onFilterChange();
  }

  nextPage(): void {
    if (this.page() * this.limit >= this.total()) return;
    this.page.update(p => p + 1);
    this.loadLotes();
  }

  prevPage(): void {
    if (this.page() <= 1) return;
    this.page.update(p => p - 1);
    this.loadLotes();
  }

  toggleDetail(batch: Batch): void {
    if (this.expandedIds.has(batch.id)) {
      this.expandedIds.delete(batch.id);
    } else {
      this.expandedIds.add(batch.id);
    }
  }

  isExpanded(id: number): boolean {
    return this.expandedIds.has(id);
  }

  formatYield(batch: Batch): string {
    return batch.yield != null ? `${(batch.yield * 100).toFixed(1)}%` : '—';
  }
}
