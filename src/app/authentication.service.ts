import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(
    public angularFireAuth: AngularFireAuth
  ) { }

  async registerUser(email: string, password: string) {
    return await this.angularFireAuth.createUserWithEmailAndPassword(email, password);
  }

  async logInUser(email: string, password: string) {
    return await this.angularFireAuth.signInWithEmailAndPassword(email, password);
  }

  async resetPassword(email: string) {
    return await this.angularFireAuth.sendPasswordResetEmail(email);
  }

  async logOutUser() {
    return await this.angularFireAuth.signOut();
  }

  async getUserProfile() {
    return this.angularFireAuth.currentUser;
  }
}
