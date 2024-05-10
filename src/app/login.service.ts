import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Consts } from './consts';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(
    private authService: AuthenticationService,
    private storageService: StorageService,
    private consts: Consts
  ) { }

  async login(email: string, password: string) {
    return this.authService.logInUser(email, password);
  }

  async isLoggedIn(): Promise<boolean> {
    const user = await this.storageService.get(this.consts.USERDETAILS.USER_ID);
    console.log(`User from storage: ${user}`);
    if (user) {
        return true;
    }
    return false;
  }

}
