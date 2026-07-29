import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Supply } from '../../../../models/supply.model';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

@Component({
  selector: 'app-supplies-table',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatFormFieldModule, MatInputModule, MatIconModule,
    MatSelectModule, MatOptionModule
  ],
  templateUrl: './supplies-table.html',
  styleUrl: './supplies-table.scss',
})
export class SuppliesTable {
  supplies = input.required<Supply[]>();

  searchTerm = '';
  selectedCategoryId: number | null = null;
  displayedColumns = ['name', 'supplier', 'currentStock', 'minStock', 'costPrice', 'status'];

  get categorias(): { id: number; name: string }[] {
    const map = new Map<number, string>();
    this.supplies().forEach(i => {
      if (i.category) map.set(i.category.id, i.category.name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }

  get filteredInsumos(): Supply[] {
    return this.supplies().filter(insumo => {
      const matchName = !this.searchTerm ||
        insumo.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchCategory = this.selectedCategoryId === null ||
        insumo.category?.id === this.selectedCategoryId;
      return matchName && matchCategory;
    });
  }

  getStockPercent(insumo: Supply): number {
    return Math.min((insumo.currentStock / insumo.minStock) * 100, 100);
  }

  getEstado(insumo: Supply): { color: string; label: string; chipClass: string } {
    const ratio = insumo.currentStock / insumo.minStock;

    if (ratio < 1) {
      return { color: 'var(--color-danger)', label: 'CRÍTICO', chipClass: 'chip-danger' };
    } else if (ratio < 1.2) {
      return { color: 'var(--color-warning)', label: 'BAJO', chipClass: 'chip-warn' };
    } else {
      return { color: 'var(--color-success)', label: 'OK', chipClass: 'chip-ok' };
    }
  }
}
