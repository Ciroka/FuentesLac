import { Component, OnInit, ChangeDetectorRef, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ProductionService } from '../../services/production.service';
import { ProductsService } from '../../services/products.service';
import { SuppliesService } from '../../services/supplies.service';
import { Product } from '../../models/product.model';
import { Supply } from '../../models/supply.model';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface SupplyConsumptionRow {
  supplyId: number | null;
  quantity: number | null;
}

interface ProductionLineRow {
  productId: number | null;
  quantity: number | null;
  clientBatchDate: string | null;
  supplies: SupplyConsumptionRow[];
}

@Component({
  selector: 'app-production-form',
  standalone: true,
  imports: [
    Navbar, CommonModule, FormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule, MatIconModule,
    MatSelectModule, MatOptionModule, MatButtonModule, MatProgressSpinnerModule,
  ],
  templateUrl: './production-form.html',
  styleUrl: './production-form.scss',
})
export class ProductionForm implements OnInit {
  private productionService = inject(ProductionService);
  private productsService = inject(ProductsService);
  private suppliesService = inject(SuppliesService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  products: Product[] = [];
  supplies: Supply[] = [];
  lines: ProductionLineRow[] = [this.emptyLine()];

  submitting = signal(false);
  errorMessage = signal('');

  ngOnInit(): void {
    forkJoin({
      products: this.productsService.findAll(),
      supplies: this.suppliesService.findAll(),
    }).subscribe({
      next: ({ products, supplies }) => {
        this.products = products;
        this.supplies = supplies;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar datos para la producción:', err)
    });
  }

  private emptyLine(): ProductionLineRow {
    return { productId: null, quantity: null, clientBatchDate: null, supplies: [this.emptySupply()] };
  }

  private emptySupply(): SupplyConsumptionRow {
    return { supplyId: null, quantity: null };
  }

  addLine(): void {
    this.lines.push(this.emptyLine());
  }

  removeLine(index: number): void {
    if (this.lines.length === 1) return;
    this.lines.splice(index, 1);
  }

  addSupply(line: ProductionLineRow): void {
    line.supplies.push(this.emptySupply());
  }

  removeSupply(line: ProductionLineRow, index: number): void {
    if (line.supplies.length === 1) return;
    line.supplies.splice(index, 1);
  }

  getSupply(supplyId: number | null): Supply | undefined {
    if (!supplyId) return undefined;
    return this.supplies.find(s => s.id === supplyId);
  }

  isValid(): boolean {
    if (this.lines.length === 0) return false;

    return this.lines.every(line => {
      if (!line.productId || !line.quantity || line.quantity <= 0) return false;
      if (line.supplies.length === 0) return false;
      return line.supplies.every(s => {
        if (!s.supplyId || !s.quantity || s.quantity <= 0) return false;
        const supply = this.getSupply(s.supplyId);
        return !!supply && s.quantity <= supply.currentStock;
      });
    });
  }

  submit(): void {
    if (!this.isValid() || this.submitting()) return;

    this.submitting.set(true);
    this.errorMessage.set('');

    this.productionService.create({
      details: this.lines.map(line => ({
        productId: line.productId!,
        quantity: line.quantity!,
        clientBatchDate: line.clientBatchDate ?? undefined,
        details: line.supplies.map(s => ({
          supplyId: s.supplyId!,
          quantity: s.quantity!,
        })),
      })),
    }).subscribe({
      next: () => this.router.navigate(['/production']),
      error: (err) => this.handleError(err)
    });
  }

  private handleError(err: { error?: { message?: string } }): void {
    this.submitting.set(false);
    this.errorMessage.set(err?.error?.message ?? 'Ocurrió un error al registrar la producción.');
    this.cdr.detectChanges();
  }
}
