import { Component, OnInit, inject, signal } from '@angular/core';
import { Navbar } from '../../shared/navbar/navbar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientsService } from '../../services/clients.service';
import { Client } from '../../models/client.model';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    Navbar, CommonModule, FormsModule,
    MatTableModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule
  ],
  templateUrl: './clients.html',
  styleUrl: './clients.scss',
})
export class Clients implements OnInit {
  private clientsService = inject(ClientsService);

  readonly limit = 10;

  clientes = signal<Client[]>([]);
  page = signal(1);
  total = signal(0);
  searchTerm = '';
  displayedColumns = ['name', 'lastName', 'phone', 'cuit', 'email'];

  ngOnInit(): void {
    this.loadClientes();
  }

  loadClientes(): void {
    this.clientsService.findPage(this.page(), this.limit, this.searchTerm || undefined).subscribe({
      next: (res) => {
        this.clientes.set(res.items);
        this.total.set(res.total);
      },
      error: (err) => console.error('Error al traer clientes:', err)
    });
  }

  onSearchChange(): void {
    this.page.set(1);
    this.loadClientes();
  }

  nextPage(): void {
    if (this.page() * this.limit >= this.total()) return;
    this.page.update(p => p + 1);
    this.loadClientes();
  }

  prevPage(): void {
    if (this.page() <= 1) return;
    this.page.update(p => p - 1);
    this.loadClientes();
  }
}
