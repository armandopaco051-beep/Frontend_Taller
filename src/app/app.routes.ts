import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () =>
         import('./pages/landing/landing.component').then(m => m.LandingComponent)
    },
    {
        path: 'login', 
        loadComponent : () => import ('./pages/login/login.components').then(m => m.LoginComponent)
    },
    {
    path: 'registro',
    loadComponent: () => import('./pages/registro/registro.component').then(m => m.RegistroComponent)
    },
    {
    path: 'recuperar-password',
    loadComponent: () => import('./pages/recuperar-password/recuperar-password.component').then(m => m.RecuperarPasswordComponent)
    },
    {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboart.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil.component').then(m => m.PerfilComponent),
    canActivate: [authGuard]
  },
  {
    path: 'talleres',
    loadComponent: () => import('./pages/talleres/talleres.component').then(m => m.TalleresComponent),
    canActivate: [authGuard]
  },
  {
    path: 'tecnicos',
    loadComponent: () => import('./pages/tecnicos/tecnicos.component').then(m => m.TecnicosComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'login' }
];
