import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { OrderCard } from './order-card';
import { Order, OrderStatus } from '../../../../models/order.model';

describe('OrderCard', () => {
  let fixture: ComponentFixture<OrderCard>;
  let component: OrderCard;

  const order = (status: OrderStatus): Order => ({
    id: 1,
    date: new Date('2026-07-28'),
    status,
    orderedTotal: 2000,
    arrivalTotal: 0,
    supplier: { id: 3, name: 'Lácteos del Sur' },
    ordersDetails: [
      {
        id: 10,
        supply: { id: 5, name: 'Leche entera' },
        orderedQuantity: 20,
        arrivalQuantity: 0,
        unitPrice: 100,
        orderedSubtotal: 2000,
        arrivalSubtotal: 0,
      },
      {
        id: 11,
        supply: { id: 6, name: 'Fermento' },
        orderedQuantity: 4,
        arrivalQuantity: 0,
        unitPrice: 50,
        orderedSubtotal: 200,
        arrivalSubtotal: 0,
      },
    ],
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderCard],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderCard);
    component = fixture.componentInstance;
  });

  it('muestra acciones solo en los pedidos pendientes', () => {
    fixture.componentRef.setInput('order', order(OrderStatus.PENDING));
    fixture.detectChanges();
    expect(component.esPendiente).toBe(true);

    fixture.componentRef.setInput('order', order(OrderStatus.RECEIVED));
    fixture.detectChanges();
    expect(component.esPendiente).toBe(false);

    fixture.componentRef.setInput('order', order(OrderStatus.CANCELLED));
    fixture.detectChanges();
    expect(component.esPendiente).toBe(false);
  });

  it('no permite guardar la llegada con todas las cantidades vacías', () => {
    fixture.componentRef.setInput('order', order(OrderStatus.PENDING));
    fixture.detectChanges();

    component.abrirLlegada();
    expect(component.llegadaValida).toBe(false);
  });

  it('permite guardar apenas una cantidad es mayor a 0', () => {
    fixture.componentRef.setInput('order', order(OrderStatus.PENDING));
    fixture.detectChanges();

    component.abrirLlegada();
    component.cantidades[0].quantity = 18;

    expect(component.llegadaValida).toBe(true);
  });

  it('envía las cantidades vacías como 0', () => {
    fixture.componentRef.setInput('order', order(OrderStatus.PENDING));
    fixture.detectChanges();

    component.abrirLlegada();
    component.cantidades[0].quantity = 18;

    expect(component.armarPedidoDeLlegada()).toEqual({
      details: [
        { supplyId: 5, quantity: 18 },
        { supplyId: 6, quantity: 0 },
      ],
    });
  });
});
