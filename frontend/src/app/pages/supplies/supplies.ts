import { Component, OnInit, ChangeDetectorRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { CommonModule } from '@angular/common';
import { SuppliesService } from '../../services/supplies.service';
import { Supply } from '../../models/supply.model';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SuppliesTable } from './components/supplies-table/supplies-table';

@Component({
  selector: 'app-supplies',
  standalone: true,
  imports: [
    Navbar, CommonModule, RouterLink,
    MatTabsModule, MatIconModule, MatButtonModule,
    SuppliesTable
  ],
  templateUrl: './supplies.html',
  styleUrl: './supplies.scss',
})
export class Supplies implements OnInit {
  private suppliesService = inject(SuppliesService);
  private cdr = inject(ChangeDetectorRef);

  insumos = signal<Supply[]>([]);

  ngOnInit(): void {
    this.cargarInsumos();
  }

  private cargarInsumos(): void {
    this.suppliesService.findAll().subscribe({
      next: (data) => {
        this.insumos.set(data);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al traer insumos:', err)
    });
  }
}
