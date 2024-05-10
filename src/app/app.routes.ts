import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { LoginService } from './login.service';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'landing/:id',
    loadComponent: () =>
      import('./folder/folder.page').then((m) => m.FolderPage),
    //canActivate: [() => inject(LoginService).isLoggedIn()]
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
  }
];
