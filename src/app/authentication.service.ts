import { Injectable } from '@angular/core';
import { User } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private authStateObservable = new Subject<any>();

  constructor(
    public angularFireAuth: AngularFireAuth
  ) { 
    this.angularFireAuth.onAuthStateChanged((user) => {
      this.authStateObservable.next(user);
    });
  }

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

  async getUser() {
    return await this.angularFireAuth.currentUser;
  }

  async updateUserProfile() {
    return (await this.angularFireAuth.currentUser)?.updateProfile({displayName: "Justin Barrett"});
  }

  getAuthStateObservable(): Observable<any> {
    return this.authStateObservable.asObservable();
  }
}
