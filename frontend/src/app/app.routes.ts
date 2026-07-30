import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { roleGuard } from './guards/role.guard';
import { UserRole } from './models/auth.model';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login').then((m) => m.LoginPage),
  },
  {
    path: 'forgot-password',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password').then((m) => m.ForgotPasswordPage),
  },
  {
    path: 'reset-password',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/reset-password/reset-password').then((m) => m.ResetPasswordPage),
  },
  {
    path: '',
    canActivateChild: [authGuard],
    children: [
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
        path: 'admin',
        canActivate: [roleGuard(UserRole.ADMIN)],
        loadComponent: () => import('./pages/admin/admin').then((m) => m.Admin),
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile').then((m) => m.Profile),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/login',
  }
]
