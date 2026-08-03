import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
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
import { SuppliersService, CreateSupplier } from '../../services/suppliers.service';
import { UsersService } from '../../services/users.service';
import { AuthService } from '../../services/auth.service';
import { AuditLogService } from '../../services/audit-log.service';
import { Category } from '../../models/category.model';
import { Supplier } from '../../models/supplier.model';
import { Supply } from '../../models/supply.model';
import { Product } from '../../models/product.model';
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
  suppliesList = signal<Supply[]>([]);
  suppliesPage = signal(1);
  suppliesTotal = signal(0);
  suppliesLimit = 10;
  products = signal<Product[]>([]);
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
  savingSupplier = signal(false);
  editingSupplierId = signal<number | null>(null);
  editingCategoryId = signal<number | null>(null);
  editingSupplyId = signal<number | null>(null);
  editingProductId = signal<number | null>(null);

  newSupply: CreateSupply = { name: '', costPrice: 0, minStock: 0, currentStock: 0, isMilk: false };
  newProduct: CreateProduct = { name: '', costPrice: 0, marginPercent: 0.3, minStock: 0 };
  newCategory: CreateCategory = { name: '', description: '' };
  newAccount = { name: '', email: '', password: '' };
  newSupplier: CreateSupplier = { name: '', phone: '', email: '', address: '', cuit: '' };

  usersColumns = ['email', 'role', 'createdAt', 'actions'];
  auditColumns = ['createdAt', 'userEmail', 'action', 'resource', 'resourceId'];
  suppliersColumns = ['name', 'phone', 'email', 'cuit', 'actions'];
  categoriesColumns = ['name', 'description', 'actions'];
  suppliesColumns = ['name', 'costPrice', 'currentStock', 'minStock', 'supplier', 'actions'];
  productsColumns = ['name', 'costPrice', 'salePrice', 'marginPercent', 'minStock', 'category', 'actions'];

  ngOnInit(): void {
    this.loadCategories();
    this.loadSuppliers();
    this.loadSupplies();
    this.loadProducts();
    this.loadUsers();
    this.loadAuditLogs();
  }

  private loadSuppliers(): void {
    this.suppliersService.findAll().subscribe(data => (this.suppliers = data));
  }

  private loadCategories(): void {
    this.categoriesService.findAll().subscribe(data => (this.categories = data));
  }

  private loadSupplies(): void {
    this.suppliesService.findPage(this.suppliesPage(), this.suppliesLimit).subscribe(res => {
      this.suppliesList.set(res.items);
      this.suppliesTotal.set(res.total);
    });
  }

  nextSuppliesPage(): void {
    if (this.suppliesPage() * this.suppliesLimit >= this.suppliesTotal()) return;
    this.suppliesPage.update(p => p + 1);
    this.loadSupplies();
  }

  prevSuppliesPage(): void {
    if (this.suppliesPage() <= 1) return;
    this.suppliesPage.update(p => p - 1);
    this.loadSupplies();
  }

  private loadProducts(): void {
    this.productsService.findAll().subscribe(data => this.products.set(data));
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

  submitSupply(form: NgForm): void {
    this.savingSupply.set(true);
    const editingId = this.editingSupplyId();
    const request = editingId
      ? this.suppliesService.update(editingId, this.newSupply)
      : this.suppliesService.create(this.newSupply);

    request.subscribe({
      next: () => {
        this.savingSupply.set(false);
        toast.success(editingId ? 'Insumo actualizado' : 'Insumo creado');
        this.cancelEditSupply(form);
        this.loadSupplies();
      },
      error: () => {
        this.savingSupply.set(false);
        toast.error(editingId ? 'No se pudo actualizar el insumo' : 'No se pudo crear el insumo');
      },
    });
  }

  startEditSupply(row: Supply, form: NgForm): void {
    this.editingSupplyId.set(row.id);
    this.newSupply = {
      name: row.name,
      costPrice: row.costPrice,
      currentStock: row.currentStock,
      minStock: row.minStock,
      isMilk: row.isMilk,
      supplierId: row.supplier?.id,
      categoryId: row.category?.id,
    };
    form.resetForm(this.newSupply);
  }

  cancelEditSupply(form: NgForm): void {
    this.editingSupplyId.set(null);
    this.newSupply = { name: '', costPrice: 0, minStock: 0, currentStock: 0, isMilk: false };
    form.resetForm(this.newSupply);
  }

  removeSupply(row: Supply, form: NgForm): void {
    if (!confirm(`¿Eliminar el insumo "${row.name}"? Esta acción no se puede deshacer.`)) return;
    this.suppliesService.remove(row.id).subscribe({
      next: () => {
        toast.success('Insumo eliminado');
        if (this.editingSupplyId() === row.id) this.cancelEditSupply(form);
        this.loadSupplies();
      },
      error: () => toast.error('No se pudo eliminar el insumo'),
    });
  }

  submitSupplier(form: NgForm): void {
    this.savingSupplier.set(true);
    const editingId = this.editingSupplierId();
    const request = editingId
      ? this.suppliersService.update(editingId, this.newSupplier)
      : this.suppliersService.create(this.newSupplier);

    request.subscribe({
      next: () => {
        this.savingSupplier.set(false);
        toast.success(editingId ? 'Proveedor actualizado' : 'Proveedor creado');
        this.cancelEditSupplier(form);
        this.loadSuppliers();
      },
      error: () => {
        this.savingSupplier.set(false);
        toast.error(editingId ? 'No se pudo actualizar el proveedor' : 'No se pudo crear el proveedor');
      },
    });
  }

  startEditSupplier(row: Supplier, form: NgForm): void {
    this.editingSupplierId.set(row.id);
    this.newSupplier = { name: row.name, phone: row.phone, email: row.email, address: row.address, cuit: row.cuit };
    form.resetForm(this.newSupplier);
  }

  cancelEditSupplier(form: NgForm): void {
    this.editingSupplierId.set(null);
    this.newSupplier = { name: '', phone: '', email: '', address: '', cuit: '' };
    form.resetForm(this.newSupplier);
  }

  removeSupplier(row: Supplier, form: NgForm): void {
    if (!confirm(`¿Eliminar el proveedor "${row.name}"? Esta acción no se puede deshacer.`)) return;
    this.suppliersService.remove(row.id).subscribe({
      next: () => {
        toast.success('Proveedor eliminado');
        if (this.editingSupplierId() === row.id) this.cancelEditSupplier(form);
        this.loadSuppliers();
      },
      error: () => toast.error('No se pudo eliminar el proveedor'),
    });
  }

  submitProduct(form: NgForm): void {
    this.savingProduct.set(true);
    const editingId = this.editingProductId();
    const request = editingId
      ? this.productsService.update(editingId, this.newProduct)
      : this.productsService.create(this.newProduct);

    request.subscribe({
      next: () => {
        this.savingProduct.set(false);
        toast.success(editingId ? 'Producto actualizado' : 'Producto creado');
        this.cancelEditProduct(form);
        this.loadProducts();
      },
      error: () => {
        this.savingProduct.set(false);
        toast.error(editingId ? 'No se pudo actualizar el producto' : 'No se pudo crear el producto');
      },
    });
  }

  startEditProduct(row: Product, form: NgForm): void {
    this.editingProductId.set(row.id);
    this.newProduct = {
      name: row.name,
      costPrice: row.costPrice,
      salePrice: row.salePrice,
      marginPercent: row.marginPercent,
      minStock: row.minStock,
      categoryId: row.category?.id,
    };
    form.resetForm(this.newProduct);
  }

  cancelEditProduct(form: NgForm): void {
    this.editingProductId.set(null);
    this.newProduct = { name: '', costPrice: 0, marginPercent: 0.3, minStock: 0 };
    form.resetForm(this.newProduct);
  }

  removeProduct(row: Product, form: NgForm): void {
    if (!confirm(`¿Eliminar el producto "${row.name}"? Esta acción no se puede deshacer.`)) return;
    this.productsService.remove(row.id).subscribe({
      next: () => {
        toast.success('Producto eliminado');
        if (this.editingProductId() === row.id) this.cancelEditProduct(form);
        this.loadProducts();
      },
      error: () => toast.error('No se pudo eliminar el producto'),
    });
  }

  submitCategory(form: NgForm): void {
    this.savingCategory.set(true);
    const editingId = this.editingCategoryId();
    const payload: CreateCategory = { name: this.newCategory.name };
    if (this.newCategory.description?.trim()) {
      payload.description = this.newCategory.description.trim();
    }

    const request = editingId
      ? this.categoriesService.update(editingId, payload)
      : this.categoriesService.create(payload);

    request.subscribe({
      next: () => {
        this.savingCategory.set(false);
        toast.success(editingId ? 'Categoría actualizada' : 'Categoría creada');
        this.cancelEditCategory(form);
        this.loadCategories();
      },
      error: () => {
        this.savingCategory.set(false);
        toast.error(editingId ? 'No se pudo actualizar la categoría' : 'No se pudo crear la categoría');
      },
    });
  }

  startEditCategory(row: Category, form: NgForm): void {
    this.editingCategoryId.set(row.id);
    this.newCategory = { name: row.name, description: row.description ?? '' };
    form.resetForm(this.newCategory);
  }

  cancelEditCategory(form: NgForm): void {
    this.editingCategoryId.set(null);
    this.newCategory = { name: '', description: '' };
    form.resetForm(this.newCategory);
  }

  removeCategory(row: Category, form: NgForm): void {
    if (!confirm(`¿Eliminar la categoría "${row.name}"? Esta acción no se puede deshacer.`)) return;
    this.categoriesService.remove(row.id).subscribe({
      next: () => {
        toast.success('Categoría eliminada');
        if (this.editingCategoryId() === row.id) this.cancelEditCategory(form);
        this.loadCategories();
      },
      error: () => toast.error('No se pudo eliminar la categoría'),
    });
  }

  createAccount(form: NgForm): void {
    this.savingAccount.set(true);
    this.authService
      .register(this.newAccount.name, this.newAccount.email, this.newAccount.password)
      .subscribe({
        next: () => {
          this.savingAccount.set(false);
          toast.success('Cuenta creada');
          this.newAccount = { name: '', email: '', password: '' };
          form.resetForm(this.newAccount);
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
