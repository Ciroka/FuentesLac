import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SuppliesService } from '../../services/supplies.service';
import { Supply } from '../../models/supply.model';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-supplies',
  standalone: true,
  imports: [
    Navbar, CommonModule, FormsModule, RouterLink,
    MatTableModule, MatFormFieldModule, MatInputModule, MatIconModule,
    MatSelectModule, MatOptionModule, MatChipsModule, MatButtonModule
  ],
  templateUrl: './supplies.html',
  styleUrl: './supplies.scss',
})
export class Supplies implements OnInit {
  private suppliesService = inject(SuppliesService);
  private cdr = inject(ChangeDetectorRef);

  insumos: Supply[] = [];
  categorias: { id: number; name: string }[] = [];
  searchTerm = '';
  selectedCategoryId: number | null = null;
  displayedColumns = ['name', 'category', 'supplier', 'currentStock', 'minStock', 'costPrice', 'status'];

  ngOnInit(): void {
    this.suppliesService.findAll().subscribe({
      next: (data) => {
        this.insumos = data;
        this.categorias = this.extraerCategorias(data);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al traer insumos:', err)
    });
  }

  get filteredInsumos(): Supply[] {
    return this.insumos.filter(insumo => {
      const matchName = !this.searchTerm ||
        insumo.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchCategory = this.selectedCategoryId === null ||
        insumo.category?.id === this.selectedCategoryId;
      return matchName && matchCategory;
    });
  }

  extraerCategorias(insumos: Supply[]): { id: number; name: string }[] {
    const map = new Map<number, string>();
    insumos.forEach(i => {
      if (i.category) map.set(i.category.id, i.category.name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
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
