import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Subject } from 'rxjs';
import { NavController } from '@ionic/angular';
import { getAuth, updatePassword, verifyBeforeUpdateEmail } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private authStateObservable = new Subject<firebase.default.User | null>();

  constructor(
    public angularFireAuth: AngularFireAuth,
    public navCtrl: NavController
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

  async updateUserProfile(newName: string) {
    return (await this.angularFireAuth.currentUser)?.updateProfile({ displayName: newName});
  }

  async updateUserEmail(newEmail: string) {
    const auth = getAuth();
    if (auth.currentUser) {
      return await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
    }
  }

  async updateUserPassword(newPassword: string) {
    const auth = getAuth();
    if (auth.currentUser) {
      return await updatePassword(auth.currentUser, newPassword);
    }
  }

  getAuthStateObservable() {
    return this.authStateObservable.asObservable();
  }

  // We need to route after auth state changed is called
  // navigation service to handle this?
  async isAuthenticated(): Promise<boolean> {
    let isAuthenticated = false;
    await this.getUser().then((user) => {
      if (user == null) {
        this.navCtrl.navigateRoot('login');
      }
      else {
        isAuthenticated = true;
      }
    });
    return isAuthenticated;
  }

}
