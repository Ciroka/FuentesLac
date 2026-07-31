import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { SalesService } from '../../services/sales.service';
import { ClientsService } from '../../services/clients.service';
import { ProductsService } from '../../services/products.service';
import { BatchService } from '../../services/batch.service';
import { Client, CreateClientRequest } from '../../models/client.model';
import { Product } from '../../models/product.model';
import { Batch } from '../../models/batch.model';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface SaleItemRow {
  productId: number | null;
  batchId: number | null;
  quantity: number | null;
  weight: number | null;
}

const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

@Component({
  selector: 'app-sale-form',
  standalone: true,
  imports: [
    Navbar, CommonModule, FormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule, MatIconModule,
    MatSelectModule, MatOptionModule, MatButtonModule, MatButtonToggleModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './sale-form.html',
  styleUrl: './sale-form.scss',
})
export class SaleForm implements OnInit, OnDestroy {
  private salesService = inject(SalesService);
  private clientsService = inject(ClientsService);
  private productsService = inject(ProductsService);
  private batchService = inject(BatchService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  clients: Client[] = [];
  products: Product[] = [];
  batches: Batch[] = [];

  clientMode: 'existing' | 'new' = 'existing';
  selectedClientId: number | null = null;
  newClient: CreateClientRequest = { name: '', lastName: '', phone: '', cuit: '', email: '' };
  items: SaleItemRow[] = [this.emptyItem()];

  photoFile: File | null = null;
  photoPreview = signal<string | null>(null);
  photoError = signal('');
  readonly maxPhotoSizeMb = MAX_PHOTO_SIZE_BYTES / (1024 * 1024);

  /** Id de la venta ya creada: evita duplicarla si falla la subida de la foto. */
  createdSaleId = signal<number | null>(null);

  submitting = signal(false);
  errorMessage = signal('');

  ngOnInit(): void {
    forkJoin({
      clients: this.clientsService.findAll(),
      products: this.productsService.findAll(),
      batches: this.batchService.findAll(),
    }).subscribe({
      next: ({ clients, products, batches }) => {
        this.clients = clients;
        this.products = products;
        this.batches = batches;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar datos para la venta:', err)
    });
  }

  ngOnDestroy(): void {
    this.revokePreview();
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    input.value = '';

    if (!file) return;

    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      this.photoError.set('Formato no permitido. Usá JPG, PNG o WEBP.');
      return;
    }

    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      this.photoError.set(`La foto no puede superar los ${this.maxPhotoSizeMb} MB.`);
      return;
    }

    this.revokePreview();
    this.photoError.set('');
    this.photoFile = file;
    this.photoPreview.set(URL.createObjectURL(file));
    this.cdr.detectChanges();
  }

  clearPhoto(): void {
    this.revokePreview();
    this.photoFile = null;
    this.photoPreview.set(null);
    this.photoError.set('');
  }

  goToSales(): void {
    void this.router.navigate(['/sales']);
  }

  private revokePreview(): void {
    const preview = this.photoPreview();
    if (preview) URL.revokeObjectURL(preview);
  }

  private emptyItem(): SaleItemRow {
    return { productId: null, batchId: null, quantity: null, weight: null };
  }

  addItem(): void {
    this.items.push(this.emptyItem());
  }

  removeItem(index: number): void {
    if (this.items.length === 1) return;
    this.items.splice(index, 1);
  }

  onProductChange(row: SaleItemRow): void {
    row.batchId = null;
    row.quantity = null;
  }

  getBatchesForProduct(productId: number | null): Batch[] {
    if (!productId) return [];
    return this.batches.filter(b => b.productId === productId && b.currentStock > 0);
  }

  getBatch(batchId: number | null): Batch | undefined {
    if (!batchId) return undefined;
    return this.batches.find(b => b.id === batchId);
  }

  getProduct(productId: number | null): Product | undefined {
    if (!productId) return undefined;
    return this.products.find(p => p.id === productId);
  }

  rowSubtotal(row: SaleItemRow): number {
    const product = this.getProduct(row.productId);
    if (!product || !row.quantity) return 0;
    return product.salePrice * row.quantity;
  }

  get total(): number {
    return this.items.reduce((sum, row) => sum + this.rowSubtotal(row), 0);
  }

  isNewClientValid(): boolean {
    const c = this.newClient;
    return !!(c.name && c.lastName && c.phone && c.cuit && c.email);
  }

  isValid(): boolean {
    if (this.clientMode === 'existing') {
      if (!this.selectedClientId) return false;
    } else if (!this.isNewClientValid()) {
      return false;
    }

    if (this.items.length === 0) return false;

    return this.items.every(row => {
      if (!row.productId || !row.batchId || !row.quantity || row.quantity <= 0) return false;
      const batch = this.getBatch(row.batchId);
      return !!batch && row.quantity <= batch.currentStock;
    });
  }

  submit(): void {
    if (this.submitting()) return;

    const pendingSaleId = this.createdSaleId();
    if (pendingSaleId !== null) {
      this.submitting.set(true);
      this.errorMessage.set('');
      this.uploadPhotoAndFinish(pendingSaleId);
      return;
    }

    if (!this.isValid()) return;

    this.submitting.set(true);
    this.errorMessage.set('');

    if (this.clientMode === 'new') {
      this.clientsService.create(this.newClient).subscribe({
        next: (client) => this.createSale(client.id),
        error: (err) => this.handleError(err)
      });
    } else {
      this.createSale(this.selectedClientId ?? undefined);
    }
  }

  private createSale(clientId?: number): void {
    this.salesService.create({
      clientId,
      details: this.items.map(row => ({
        batchId: row.batchId!,
        quantity: row.quantity!,
        weight: row.weight ?? undefined,
      })),
    }).subscribe({
      next: (sale) => {
        this.createdSaleId.set(sale.id);
        this.uploadPhotoAndFinish(sale.id);
      },
      error: (err) => this.handleError(err)
    });
  }

  private uploadPhotoAndFinish(saleId: number): void {
    if (!this.photoFile) {
      this.goToSales();
      return;
    }

    this.salesService.uploadPhoto(saleId, this.photoFile).subscribe({
      next: () => this.goToSales(),
      error: () => {
        this.submitting.set(false);
        this.errorMessage.set(
          `La venta #${saleId} se registró, pero no se pudo subir la foto. Reintentá o continuá sin foto.`
        );
        this.cdr.detectChanges();
      }
    });
  }

  private handleError(err: { error?: { message?: string } }): void {
    this.submitting.set(false);
    this.errorMessage.set(err?.error?.message ?? 'Ocurrió un error al registrar la venta.');
    this.cdr.detectChanges();
  }

  formatCurrency(value: number): string {
    return `$${value.toLocaleString('es-AR')}`;
  }
}
