import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SaleForm } from './sale-form';
import { environment } from '../../../environments/environment';

describe('SaleForm', () => {
  let component: SaleForm;
  let fixture: ComponentFixture<SaleForm>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaleForm],
      providers: [provideRouter([{ path: 'sales', component: SaleForm }]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(SaleForm);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    fixture.detectChanges();
    httpMock.expectOne(`${environment.apiUrl}/clients?limit=1000`).flush({ items: [] });
    httpMock.expectOne(`${environment.apiUrl}/products?limit=1000`).flush({ items: [{ id: 1, name: 'Queso Cremoso', salePrice: 100, costPrice: 60, marginPercent: 0.3, minStock: 5 }] });
    httpMock.expectOne(`${environment.apiUrl}/batch?limit=1000`).flush({ items: [{ id: 10, productId: 1, currentStock: 20 }], total: 1, page: 1, limit: 1000 });
  });

  afterEach(() => httpMock.verify());

  it('prefills the unit price with the product sale price when a product is selected', () => {
    const row = component.items[0];
    row.productId = 1;

    component.onProductChange(row);

    expect(row.unitPrice).toBe(100);
  });

  it('uses the edited unit price for the row subtotal', () => {
    const row = component.items[0];
    row.productId = 1;
    row.quantity = 2;
    row.unitPrice = 80;

    expect(component.rowSubtotal(row)).toBe(160);
  });

  it('sends the edited unit price in the create payload', () => {
    component.selectedClientId = 3;
    component.items = [{ productId: 1, batchId: 10, quantity: 2, weight: null, unitPrice: 80 }];

    component.submit();

    const req = httpMock.expectOne(`${environment.apiUrl}/sales`);
    expect(req.request.body.details[0].unitPrice).toBe(80);
    req.flush({ id: 1 });
  });
});
