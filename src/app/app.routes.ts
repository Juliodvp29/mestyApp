import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'chats',
    pathMatch: 'full',
  },
  {
    path: 'chats',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/chats/chat-list.component').then((m) => m.ChatListComponent),
      },
      {
        path: ':id',
        loadComponent: () => import('./features/chats/chat-detail/chat-detail.component').then((m) => m.ChatDetailComponent),
      },
    ],
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
      },
      {
        path: 'two-fa-setup',
        loadComponent: () => import('./features/auth/two-fa-setup/two-fa-setup.component').then((m) => m.TwoFaSetupComponent),
        canActivate: [authGuard],
      },
      {
        path: 'sessions',
        loadComponent: () => import('./features/auth/sessions/sessions.component').then((m) => m.SessionsComponent),
        canActivate: [authGuard],
      },
    ],
  },
];
