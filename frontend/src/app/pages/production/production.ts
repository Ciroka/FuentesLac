import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductionService } from '../../services/production.service';
import { Production as ProductionRecord, ProductionDetail } from '../../models/production.model';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-production',
  standalone: true,
  imports: [
    Navbar, CommonModule, FormsModule, RouterLink,
    MatTableModule, MatFormFieldModule, MatInputModule, MatIconModule,
    MatButtonModule, MatTooltipModule
  ],
  templateUrl: './production.html',
  styleUrl: './production.scss',
})
export class Production implements OnInit {
  private productionService = inject(ProductionService);
  private cdr = inject(ChangeDetectorRef);

  producciones: ProductionRecord[] = [];
  searchTerm = '';
  expandedIds = new Set<number>();
  displayedColumns = ['toggle', 'id', 'date', 'products', 'totalQuantity'];

  ngOnInit(): void {
    this.productionService.findAll().subscribe({
      next: (data) => {
        this.producciones = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al traer producción:', err)
    });
  }

  get filteredProducciones(): ProductionRecord[] {
    if (!this.searchTerm) return this.producciones;
    const term = this.searchTerm.toLowerCase();
    return this.producciones.filter(produccion =>
      this.getProductNames(produccion).toLowerCase().includes(term)
    );
  }

  toggleDetail(produccion: ProductionRecord): void {
    if (this.expandedIds.has(produccion.id)) {
      this.expandedIds.delete(produccion.id);
    } else {
      this.expandedIds.add(produccion.id);
    }
  }

  isExpanded(id: number): boolean {
    return this.expandedIds.has(id);
  }

  getProductNames(produccion: ProductionRecord): string {
    if (!produccion.details?.length) return '—';
    return produccion.details.map(d => d.product?.name ?? '—').join(', ');
  }

  getTotalQuantity(produccion: ProductionRecord): number {
    return (produccion.details ?? []).reduce((sum, d) => sum + d.quantity, 0);
  }

  getSupplyNames(detail: ProductionDetail): string {
    if (!detail.supplyXDetail?.length) return '—';
    return detail.supplyXDetail
      .map(s => `${s.supply?.name ?? '—'} (${s.quantity})`)
      .join(', ');
  }
}
