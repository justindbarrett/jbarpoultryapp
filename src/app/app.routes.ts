import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { LoginService } from './login.service';
import { AppPages } from './pages.service';


export const routes: Routes = [
  {
    path: '',
    redirectTo: 'landing/customers',
    pathMatch: 'full',
  },
  {
    path: 'landing/customers',
    loadComponent: () =>
      import('./folder/folder.page').then((m) => m.FolderPage),
    canActivate: [() => inject(LoginService).isLoggedIn()]
  },
  {
    path: 'landing/schedule',
    loadComponent: () =>
      import('./folder/folder.page').then((m) => m.FolderPage),
    canActivate: [() => inject(LoginService).isLoggedIn()]
  },
  {
    path: 'landing/lots/:id',
    loadComponent: () =>
      import('./pages/lots/lot-detail.page').then((m) => m.LotDetailPage),
    canActivate: [() => inject(LoginService).isLoggedIn()]
  },
  {
    path: 'landing/lots',
    loadComponent: () =>
      import('./folder/folder.page').then((m) => m.FolderPage),
    canActivate: [() => inject(LoginService).isLoggedIn()]
  },
  {
    path: 'landing/accountsettings',
    loadComponent: () =>
      import('./folder/folder.page').then((m) => m.FolderPage),
    canActivate: [() => inject(LoginService).isLoggedIn()]
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/signup/signup.page').then( m => m.SignupPage)
  },
  {
    path: 'forgotpassword',
    loadComponent: () => import('./pages/forgotpassword/forgotpassword.page').then( m => m.ForgotpasswordPage)
  },
  {
    path: '**',
    loadComponent: () => import('./pages/notfound/notfound.page').then( m => m.NotFoundPage)
}
];
