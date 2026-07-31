import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Supply } from '../../../../models/supply.model';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-supplies-table',
  standalone: true,
  imports: [CommonModule, MatTableModule],
  templateUrl: './supplies-table.html',
  styleUrl: './supplies-table.scss',
})
export class SuppliesTable {
  supplies = input.required<Supply[]>();

  displayedColumns = ['name', 'supplier', 'currentStock', 'minStock', 'costPrice', 'status'];

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
