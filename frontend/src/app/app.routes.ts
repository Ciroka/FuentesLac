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
    loadComponent: () => import('./pages/home/home').then((m) => m.HomePage),
  },
  {
    path: 'supplies',
    loadComponent: () => import('./pages/supplies/supplies').then((m) => m.Supplies),
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
    path: 'clients',
    loadComponent: () => import('./pages/clients/clients').then((m) => m.Clients),
  },
  {
    path: '**',
    redirectTo: '/login',
  }
]
