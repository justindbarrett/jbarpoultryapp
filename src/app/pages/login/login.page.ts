import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonRow, IonCard, IonItem } from '@ionic/angular/standalone';
import { AuthenticationService } from 'src/app/authentication.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireModule } from '@angular/fire/compat';
import { NavController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [ IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonRow, IonCard, IonItem ],
  providers: [ AuthenticationService, AngularFireAuth, AngularFireModule]
})
export class LoginPage implements OnInit {

  public email: string = "";
  public password: string = "";
  private disableSignInButton = false;

  constructor(
    private authService: AuthenticationService,
    private navCtrl: NavController,
    private alertCtrl: AlertController) { }

  ngOnInit() {
  }

  login() {
    this.disableSignInButton = true;
    console.log(`login`);
    console.log(`Email: ${this.email}`);
    console.log(`PW: ${this.password}`);
    this.authService.logInUser(this.email, this.password)
    .then(auth => {
         this.navCtrl.navigateForward("folder/inbox");
    })
    .catch(err => { console.log(JSON.stringify(err)); this.presentAlert(err.code); })
  }

  gotoSignup() {
    console.log(`signup`);
    this.navCtrl.navigateForward('signup');
  }

  gotoForgotPassword() {
    console.log(`forgot password`);
    this.navCtrl.navigateForward('forgotpassword');
  }

  disableSignIn(): boolean {
    return !(this.email && this.password) || this.disableSignInButton;
  }

  async presentAlert(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Failed Sign In Attempt',
      message: message,
      buttons: ['Try Again'],
    });

    await alert.present();

    await alert.onDidDismiss().then(() => {
      this.disableSignInButton = false;
    });
  }

}
