import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { Admin } from './admin';
import { Supply } from '../../models/supply.model';
import { Product } from '../../models/product.model';
import { environment } from '../../../environments/environment';

describe('Admin', () => {
  let component: Admin;
  let fixture: ComponentFixture<Admin>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Admin],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Admin);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  /**
   * Flushea las peticiones que dispara ngOnInit(). Las Tasks 6/7 le agregan
   * parámetros opcionales (con default vacío) para las de Insumos/Productos —
   * los tests que llaman flushInitialLoad() sin argumentos siguen funcionando
   * igual después de esos cambios.
   */
  function flushInitialLoad(
    suppliesResponse: { items: Supply[]; total: number; page: number; limit: number } = { items: [], total: 0, page: 1, limit: 10 },
  ): void {
    httpMock.expectOne(`${environment.apiUrl}/categories?limit=1000`).flush({ items: [], total: 0, page: 1, limit: 1000 });
    httpMock.expectOne(`${environment.apiUrl}/suppliers?limit=1000`).flush({ items: [], total: 0, page: 1, limit: 1000 });
    httpMock.expectOne(r => r.url === `${environment.apiUrl}/supplies` && r.params.get('page') === '1').flush(suppliesResponse);
    httpMock.expectOne(`${environment.apiUrl}/products?limit=1000`).flush({ items: [], total: 0, page: 1, limit: 1000 });
    httpMock.expectOne(`${environment.apiUrl}/users?page=1&limit=10`).flush({ items: [], total: 0, page: 1, limit: 10 });
    httpMock.expectOne(`${environment.apiUrl}/audit-logs?page=1&limit=20`).flush({ items: [], total: 0, page: 1, limit: 20 });
  }

  /** NgForm mínimo: los métodos del componente solo usan resetForm(). */
  function formStub(): never {
    return { resetForm: () => undefined } as never;
  }

  /**
   * Igual que formStub() pero registra las llamadas a resetForm(). Sin resetForm()
   * el modelo se vacía pero los controles quedan touched/invalid, así que Material
   * pinta los campos requeridos en rojo apenas se borra la fila que se editaba.
   */
  function recordingFormStub(): { form: never; resetForm: ReturnType<typeof vi.fn> } {
    const resetForm = vi.fn();
    return { form: { resetForm } as never, resetForm };
  }

  it('should create and load categories, suppliers, users and audit logs on init', () => {
    flushInitialLoad();
    expect(component).toBeTruthy();
  });

  it('creates a supplier and reloads the list', () => {
    flushInitialLoad();

    component.newSupplier = { name: 'Tambo SA', phone: '111', email: 'a@a.com', address: 'Ruta 1', cuit: '20-1-1' };
    component.submitSupplier({ resetForm: () => undefined } as never);

    const createReq = httpMock.expectOne(`${environment.apiUrl}/suppliers`);
    expect(createReq.request.method).toBe('POST');
    createReq.flush({ id: 1, name: 'Tambo SA', phone: '111', email: 'a@a.com', address: 'Ruta 1', cuit: '20-1-1' });

    httpMock.expectOne(`${environment.apiUrl}/suppliers?limit=1000`).flush({
      items: [{ id: 1, name: 'Tambo SA', phone: '111', email: 'a@a.com', address: 'Ruta 1', cuit: '20-1-1' }],
    });

    expect(component.suppliers.length).toBe(1);
  });

  it('edits a supplier and leaves edit mode', () => {
    flushInitialLoad();

    const row = { id: 7, name: 'Tambo SA', phone: '111', email: 'a@a.com', address: 'Ruta 1', cuit: '20-1-1' };
    component.startEditSupplier(row, formStub());

    expect(component.editingSupplierId()).toBe(7);
    expect(component.newSupplier).toEqual({ name: 'Tambo SA', phone: '111', email: 'a@a.com', address: 'Ruta 1', cuit: '20-1-1' });

    component.newSupplier = { ...component.newSupplier, phone: '222' };
    component.submitSupplier(formStub());

    const updateReq = httpMock.expectOne(`${environment.apiUrl}/suppliers/7`);
    expect(updateReq.request.method).toBe('PATCH');
    expect(updateReq.request.body).toEqual({ name: 'Tambo SA', phone: '222', email: 'a@a.com', address: 'Ruta 1', cuit: '20-1-1' });
    updateReq.flush({ ...row, phone: '222' });

    httpMock.expectOne(`${environment.apiUrl}/suppliers?limit=1000`).flush({ items: [{ ...row, phone: '222' }] });

    expect(component.editingSupplierId()).toBeNull();
    expect(component.suppliers[0].phone).toBe('222');
  });

  it('deletes a supplier and clears the edit form when it was the one being edited', () => {
    flushInitialLoad();

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const row = { id: 7, name: 'Tambo SA', phone: '111', email: 'a@a.com', address: 'Ruta 1', cuit: '20-1-1' };
    const { form, resetForm } = recordingFormStub();
    component.startEditSupplier(row, form);
    resetForm.mockClear();

    component.removeSupplier(row, form);

    const deleteReq = httpMock.expectOne(`${environment.apiUrl}/suppliers/7`);
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush({ id: 7 });

    httpMock.expectOne(`${environment.apiUrl}/suppliers?limit=1000`).flush({ items: [] });

    expect(component.editingSupplierId()).toBeNull();
    expect(component.newSupplier).toEqual({ name: '', phone: '', email: '', address: '', cuit: '' });
    expect(resetForm).toHaveBeenCalled();
    expect(component.suppliers.length).toBe(0);

    confirmSpy.mockRestore();
  });

  it('does not delete a supplier when the confirmation is dismissed', () => {
    flushInitialLoad();

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    component.removeSupplier({ id: 7, name: 'Tambo SA', phone: '111', email: 'a@a.com', address: 'Ruta 1', cuit: '20-1-1' }, formStub());

    // El afterEach con httpMock.verify() falla si salió cualquier request.
    expect(confirmSpy).toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  it('edits a category using the same create form', () => {
    flushInitialLoad();

    const form = formStub();
    component.startEditCategory({ id: 5, name: 'Duros', description: '' }, form);
    expect(component.editingCategoryId()).toBe(5);
    expect(component.newCategory).toEqual({ name: 'Duros', description: '' });

    component.submitCategory(form);

    const req = httpMock.expectOne(`${environment.apiUrl}/categories/5`);
    expect(req.request.method).toBe('PATCH');
    req.flush({ id: 5, name: 'Duros', description: '' });

    httpMock.expectOne(`${environment.apiUrl}/categories?limit=1000`).flush({ items: [] });
    expect(component.editingCategoryId()).toBeNull();
  });

  it('deletes a category and clears the edit form when it was the one being edited', () => {
    flushInitialLoad();

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const row = { id: 5, name: 'Duros', description: '' };
    const { form, resetForm } = recordingFormStub();
    component.startEditCategory(row, form);
    resetForm.mockClear();

    component.removeCategory(row, form);

    const deleteReq = httpMock.expectOne(`${environment.apiUrl}/categories/5`);
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush({ id: 5 });

    httpMock.expectOne(`${environment.apiUrl}/categories?limit=1000`).flush({ items: [] });

    expect(component.editingCategoryId()).toBeNull();
    expect(component.newCategory).toEqual({ name: '', description: '' });
    expect(resetForm).toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  it('does not delete a category when the confirmation is dismissed', () => {
    flushInitialLoad();

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    component.removeCategory({ id: 5, name: 'Duros', description: '' }, formStub());

    // El afterEach con httpMock.verify() falla si salió cualquier request.
    expect(confirmSpy).toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  it('loads a paginated supplies list and edits one', () => {
    const supply: Supply = {
      id: 7, name: 'Cuajo', costPrice: 50, currentStock: 3, minStock: 1, isMilk: false,
      supplier: { id: 2, name: 'Tambo SA' },
    };
    flushInitialLoad({ items: [supply], total: 1, page: 1, limit: 10 });

    expect(component.suppliesList().length).toBe(1);

    const form = { resetForm: () => undefined } as never;
    component.startEditSupply(supply, form);
    expect(component.editingSupplyId()).toBe(7);
    expect(component.newSupply.supplierId).toBe(2);
  });

  it('edits a supply using the same create form', () => {
    flushInitialLoad();

    const form = formStub();
    const row: Supply = {
      id: 3, name: 'Cera', costPrice: 100, minStock: 5, currentStock: 10, isMilk: false,
      supplier: { id: 1, name: 'Supplier 1' }, category: { id: 2, name: 'Insumos' },
    };
    component.startEditSupply(row, form);
    expect(component.editingSupplyId()).toBe(3);
    expect(component.newSupply).toEqual({
      name: 'Cera', costPrice: 100, currentStock: 10, minStock: 5, isMilk: false, supplierId: 1, categoryId: 2,
    });

    component.submitSupply(form);

    const req = httpMock.expectOne(`${environment.apiUrl}/supplies/3`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({
      name: 'Cera', costPrice: 100, currentStock: 10, minStock: 5, isMilk: false, supplierId: 1, categoryId: 2,
    });
    req.flush(row);

    httpMock.expectOne(r => r.url === `${environment.apiUrl}/supplies` && r.params.get('page') === '1').flush({ items: [], total: 0, page: 1, limit: 10 });
    expect(component.editingSupplyId()).toBeNull();
  });

  it('deletes a supply and clears the edit form when it was the one being edited', () => {
    flushInitialLoad();

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const row: Supply = { id: 3, name: 'Cera', costPrice: 100, minStock: 5, currentStock: 10, isMilk: false, supplier: { id: 1, name: 'Supplier 1' } };
    const { form, resetForm } = recordingFormStub();
    component.startEditSupply(row, form);
    resetForm.mockClear();

    component.removeSupply(row, form);

    const deleteReq = httpMock.expectOne(`${environment.apiUrl}/supplies/3`);
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush({ id: 3 });

    httpMock.expectOne(r => r.url === `${environment.apiUrl}/supplies` && r.params.get('page') === '1').flush({ items: [], total: 0, page: 1, limit: 10 });

    expect(component.editingSupplyId()).toBeNull();
    expect(resetForm).toHaveBeenCalled();
    expect(component.suppliesList().length).toBe(0);

    confirmSpy.mockRestore();
  });

  it('does not delete a supply when the confirmation is dismissed', () => {
    flushInitialLoad();

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    const row: Supply = { id: 3, name: 'Cera', costPrice: 100, minStock: 5, currentStock: 10, isMilk: false, supplier: { id: 1, name: 'Supplier 1' } };
    component.removeSupply(row, formStub());

    expect(confirmSpy).toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  it('edits a product using the same create form', () => {
    flushInitialLoad();

    const form = formStub();
    const row: Product = { id: 2, name: 'Queso', costPrice: 90, salePrice: 150, marginPercent: 0.6, minStock: 5, category: { id: 9, name: 'Duros' }, totalStock: 0, isLowStock: false };
    component.startEditProduct(row, form);
    expect(component.editingProductId()).toBe(2);
    expect(component.newProduct).toEqual({
      name: 'Queso', costPrice: 90, salePrice: 150, marginPercent: 0.6, minStock: 5, categoryId: 9,
    });

    component.submitProduct(form);

    const req = httpMock.expectOne(`${environment.apiUrl}/products/2`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({
      name: 'Queso', costPrice: 90, salePrice: 150, marginPercent: 0.6, minStock: 5, categoryId: 9,
    });
    req.flush(row);

    httpMock.expectOne(`${environment.apiUrl}/products?limit=1000`).flush({ items: [] });
    expect(component.editingProductId()).toBeNull();
  });

  it('deletes a product and clears the edit form when it was the one being edited', () => {
    flushInitialLoad();

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const row: Product = { id: 2, name: 'Queso', costPrice: 90, salePrice: 150, marginPercent: 0.6, minStock: 5, category: { id: 1, name: 'Category 1' }, totalStock: 0, isLowStock: false };
    const { form, resetForm } = recordingFormStub();
    component.startEditProduct(row, form);
    resetForm.mockClear();

    component.removeProduct(row, form);

    const deleteReq = httpMock.expectOne(`${environment.apiUrl}/products/2`);
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush({ id: 2 });

    httpMock.expectOne(`${environment.apiUrl}/products?limit=1000`).flush({ items: [] });

    expect(component.editingProductId()).toBeNull();
    expect(resetForm).toHaveBeenCalled();
    expect(component.products().length).toBe(0);

    confirmSpy.mockRestore();
  });

  it('does not delete a product when the confirmation is dismissed', () => {
    flushInitialLoad();

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    const row: Product = { id: 2, name: 'Queso', costPrice: 90, salePrice: 150, marginPercent: 0.6, minStock: 5, category: { id: 1, name: 'Category 1' }, totalStock: 0, isLowStock: false };
    component.removeProduct(row, formStub());

    expect(confirmSpy).toHaveBeenCalled();

    confirmSpy.mockRestore();
  });
});
