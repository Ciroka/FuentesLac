import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../shared/navbar/navbar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { toast } from 'ngx-sonner';

import { SuppliesService, CreateSupply } from '../../services/supplies.service';
import { ProductsService, CreateProduct } from '../../services/products.service';
import { CategoriesService, CreateCategory } from '../../services/categories.service';
import { SuppliersService } from '../../services/suppliers.service';
import { UsersService } from '../../services/users.service';
import { AuthService } from '../../services/auth.service';
import { AuditLogService } from '../../services/audit-log.service';
import { Category } from '../../models/category.model';
import { Supplier } from '../../models/supplier.model';
import { AuthUser, UserRole } from '../../models/auth.model';
import { AuditLog } from '../../models/audit-log.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule, FormsModule, Navbar,
    MatTabsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatOptionModule,
    MatButtonModule, MatIconModule, MatTableModule, MatCheckboxModule,
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin implements OnInit {
  private readonly suppliesService = inject(SuppliesService);
  private readonly productsService = inject(ProductsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly suppliersService = inject(SuppliersService);
  private readonly usersService = inject(UsersService);
  private readonly authService = inject(AuthService);
  private readonly auditLogService = inject(AuditLogService);

  readonly UserRole = UserRole;

  categories: Category[] = [];
  suppliers: Supplier[] = [];
  users = signal<AuthUser[]>([]);
  usersPage = signal(1);
  usersTotal = signal(0);
  usersLimit = 10;
  auditLogs = signal<AuditLog[]>([]);
  auditPage = signal(1);
  auditTotal = signal(0);
  auditLimit = 20;

  savingSupply = signal(false);
  savingProduct = signal(false);
  savingCategory = signal(false);
  savingAccount = signal(false);

  newSupply: CreateSupply = { name: '', costPrice: 0, minStock: 0, currentStock: 0, isMilk: false };
  newProduct: CreateProduct = { name: '', costPrice: 0, marginPercent: 0.3, minStock: 0 };
  newCategory: CreateCategory = { name: '', description: '' };
  newAccount = { name: '', email: '', password: '' };

  usersColumns = ['email', 'role', 'createdAt', 'actions'];
  auditColumns = ['createdAt', 'userEmail', 'action', 'resource', 'resourceId'];

  ngOnInit(): void {
    this.loadCategories();
    this.suppliersService.findAll().subscribe(data => (this.suppliers = data));
    this.loadUsers();
    this.loadAuditLogs();
  }

  private loadCategories(): void {
    this.categoriesService.findAll().subscribe(data => (this.categories = data));
  }

  private loadUsers(): void {
    this.usersService.findPage(this.usersPage(), this.usersLimit).subscribe(res => {
      this.users.set(res.items);
      this.usersTotal.set(res.total);
    });
  }

  nextUsersPage(): void {
    if (this.usersPage() * this.usersLimit >= this.usersTotal()) return;
    this.usersPage.update(p => p + 1);
    this.loadUsers();
  }

  prevUsersPage(): void {
    if (this.usersPage() <= 1) return;
    this.usersPage.update(p => p - 1);
    this.loadUsers();
  }

  private loadAuditLogs(): void {
    this.auditLogService.findAll(this.auditPage(), this.auditLimit).subscribe(res => {
      this.auditLogs.set(res.items);
      this.auditTotal.set(res.total);
    });
  }

  createSupply(): void {
    this.savingSupply.set(true);
    this.suppliesService.create(this.newSupply).subscribe({
      next: () => {
        this.savingSupply.set(false);
        toast.success('Insumo creado');
        this.newSupply = { name: '', costPrice: 0, minStock: 0, currentStock: 0, isMilk: false };
      },
      error: () => {
        this.savingSupply.set(false);
        toast.error('No se pudo crear el insumo');
      },
    });
  }

  createProduct(): void {
    this.savingProduct.set(true);
    this.productsService.create(this.newProduct).subscribe({
      next: () => {
        this.savingProduct.set(false);
        toast.success('Producto creado');
        this.newProduct = { name: '', costPrice: 0, marginPercent: 0.3, minStock: 0 };
      },
      error: () => {
        this.savingProduct.set(false);
        toast.error('No se pudo crear el producto');
      },
    });
  }

  createCategory(): void {
    this.savingCategory.set(true);
    const payload: CreateCategory = { name: this.newCategory.name };
    if (this.newCategory.description?.trim()) {
      payload.description = this.newCategory.description.trim();
    }

    this.categoriesService.create(payload).subscribe({
      next: () => {
        this.savingCategory.set(false);
        toast.success('Categoría creada');
        this.newCategory = { name: '', description: '' };
        this.loadCategories();
      },
      error: () => {
        this.savingCategory.set(false);
        toast.error('No se pudo crear la categoría');
      },
    });
  }

  createAccount(): void {
    this.savingAccount.set(true);
    this.authService
      .register(this.newAccount.name, this.newAccount.email, this.newAccount.password)
      .subscribe({
        next: () => {
          this.savingAccount.set(false);
          toast.success('Cuenta creada');
          this.newAccount = { name: '', email: '', password: '' };
          this.loadUsers();
        },
        error: () => {
          this.savingAccount.set(false);
          toast.error('No se pudo crear la cuenta');
        },
      });
  }

  changeRole(user: AuthUser, role: UserRole): void {
    this.usersService.updateRole(user.id, role).subscribe({
      next: () => {
        toast.success('Rol actualizado');
        this.loadUsers();
      },
      error: () => toast.error('No se pudo actualizar el rol'),
    });
  }

  removeUser(user: AuthUser): void {
    this.usersService.remove(user.id).subscribe({
      next: () => {
        toast.success('Cuenta eliminada');
        this.loadUsers();
      },
      error: () => toast.error('No se pudo eliminar la cuenta'),
    });
  }

  nextAuditPage(): void {
    if (this.auditPage() * this.auditLimit >= this.auditTotal()) return;
    this.auditPage.update(p => p + 1);
    this.loadAuditLogs();
  }

  prevAuditPage(): void {
    if (this.auditPage() <= 1) return;
    this.auditPage.update(p => p - 1);
    this.loadAuditLogs();
  }
}
