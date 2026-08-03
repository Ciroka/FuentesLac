import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Supply } from '../../../../models/supply.model';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-supplies-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './supplies-table.html',
  styleUrl: './supplies-table.scss',
})
export class SuppliesTable {
  supplies = input.required<Supply[]>();

  displayedColumns = ['toggle', 'name', 'currentStock'];

  private expandedIds = new Set<number>();

  toggleDetail(supply: Supply): void {
    if (this.expandedIds.has(supply.id)) {
      this.expandedIds.delete(supply.id);
    } else {
      this.expandedIds.add(supply.id);
    }
  }

  isExpanded(id: number): boolean {
    return this.expandedIds.has(id);
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
