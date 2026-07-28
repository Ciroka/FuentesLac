import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.LoginPage),
  },
  {
    path: 'home',
    loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'supplies',
    loadComponent: () => import('./pages/supplies/supplies').then((m) => m.Supplies),
  },
  {
    path: 'supplies/order',
    loadComponent: () => import('./pages/order-form/order-form').then((m) => m.OrderForm),
  },
  {
    path: 'products',
    loadComponent: () => import('./pages/products/products').then((m) => m.Products),
  },
  {
    path: 'sales',
    loadComponent: () => import('./pages/sales/sales').then((m) => m.Sales),
  },
  {
    path: 'sales/new',
    loadComponent: () => import('./pages/sale-form/sale-form').then((m) => m.SaleForm),
  },
  {
    path: 'clients',
    loadComponent: () => import('./pages/clients/clients').then((m) => m.Clients),
  },
  {
    path: 'production',
    loadComponent: () => import('./pages/production/production').then((m) => m.Production),
  },
  {
    path: 'production/new',
    loadComponent: () => import('./pages/production-form/production-form').then((m) => m.ProductionForm),
  },
  {
    path: '**',
    redirectTo: '/login',
  }
]
