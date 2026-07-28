import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { Navbar } from '../../shared/navbar/navbar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientsService } from '../../services/clients.service';
import { Client } from '../../models/client.model';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    Navbar, CommonModule, FormsModule,
    MatTableModule, MatFormFieldModule, MatInputModule, MatIconModule
  ],
  templateUrl: './clients.html',
  styleUrl: './clients.scss',
})
export class Clients implements OnInit {
  private clientsService = inject(ClientsService);
  private cdr = inject(ChangeDetectorRef);

  clientes: Client[] = [];
  searchTerm = '';
  displayedColumns = ['name', 'lastName', 'phone', 'cuit', 'email'];

  ngOnInit(): void {
    this.clientsService.findAll().subscribe({
      next: (data) => {
        this.clientes = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al traer clientes:', err)
    });
  }

  get filteredClientes(): Client[] {
    if (!this.searchTerm) return this.clientes;
    const term = this.searchTerm.toLowerCase();
    return this.clientes.filter(cliente =>
      `${cliente.name} ${cliente.lastName}`.toLowerCase().includes(term) ||
      cliente.cuit.includes(term) ||
      cliente.email.toLowerCase().includes(term)
    );
  }
}
