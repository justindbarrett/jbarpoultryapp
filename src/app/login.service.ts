import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Consts } from './consts';
import { AuthenticationService } from './authentication.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private storageService: StorageService,
    private consts: Consts
  ) { }

  async login(email: string, password: string) {
    return this.authService.logInUser(email, password);
  }

  isLoggedIn(): boolean {
    if (localStorage.getItem('isAuthenticated') === 'true') {
      return true;
    }
    else {
      this.router.navigateByUrl("login");
      return false;
    }
  }

}
