import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Navbar } from '../../shared/navbar/navbar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SuppliesService } from '../../services/supplies.service';
import { Supply } from '../../models/supply.model';

@Component({
  selector: 'app-supplies',
  standalone: true,
  imports: [Navbar, CommonModule, FormsModule],
  templateUrl: './supplies.html',
  styleUrl: './supplies.scss',
})
export class Supplies implements OnInit {
  insumos: Supply[] = [];
  categorias: { id: number; name: string }[] = [];
  searchTerm = '';
  selectedCategoryId: number | null = null;

  constructor(
    private SuppliesService: SuppliesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.SuppliesService.findAll().subscribe({
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

  // Calcula el % de la barra de stock
  getStockPercent(insumo: Supply): number {
    return Math.min((insumo.currentStock / insumo.minStock) * 100, 100);
  }

  // Determina el color de la barra y el estado (OK / BAJO / CRÍTICO)
  getEstado(insumo: Supply): { color: string; label: string; tagClass: string } {
    const ratio = insumo.currentStock / insumo.minStock;

    if (ratio < 1) {
      return { color: 'var(--wax)', label: 'CRÍTICO', tagClass: 'tag-danger' };
    } else if (ratio < 1.2) {
      return { color: 'var(--gold)', label: 'BAJO', tagClass: 'tag-warn' };
    } else {
      return { color: 'var(--green)', label: 'OK', tagClass: 'tag-ok' };
    }
  }
}