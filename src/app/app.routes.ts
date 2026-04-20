import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs/chats',
    pathMatch: 'full',
  },
  {
    path: 'tabs',
    children: [
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
            children: [
              {
                path: '',
                loadComponent: () => import('./features/chats/chat-detail/chat-detail.component').then((m) => m.ChatDetailComponent),
              },
              {
                path: 'group-info',
                loadComponent: () => import('./features/chats/group-info/group-info.component').then((m) => m.GroupInfoComponent),
              }
            ]
          },
        ],
      },
      {
        path: 'settings',
        canActivate: [authGuard],
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
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
  {
    path: 'contacts',
    canActivate: [authGuard],
    loadComponent: () => import('./features/contacts/contact-list/contact-list.component').then(m => m.ContactListComponent),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile-edit/profile-edit-modal.component').then(m => m.ProfileEditModalComponent),
  },
  {
    path: '**',
    redirectTo: 'tabs/chats',
  },
];
