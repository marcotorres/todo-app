import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from '@core/guards';
import { abilityGuard } from '@core/guards/ability.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/components/login/login.component').then(m => m.LoginComponent),
    canActivate: [noAuthGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/components/register/register.component').then(m => m.RegisterComponent),
    canActivate: [noAuthGuard]
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./features/auth/components/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  {
    path: 'tasks',
    loadChildren: () => import('./features/tasks/tasks.routes').then(m => m.TASKS_ROUTES),
    canActivate: [authGuard, abilityGuard],
    data: { action: 'read', subject: 'Task' }
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
