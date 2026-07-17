import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/login/login').then((m) => m.LoginPage),
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home').then((m) => m.HomePage),
  }
  
]