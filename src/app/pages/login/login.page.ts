import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonSpinner,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonRow,
  IonCard,
  IonItem,
  IonIcon,
  IonInput } from '@ionic/angular/standalone';
import { AuthenticationService } from 'src/app/authentication.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireModule } from '@angular/fire/compat';
import { NavController, AlertController } from '@ionic/angular';
import { eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { IdentityService } from 'src/app/identity.service';
import { LoginService } from 'src/app/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonSpinner,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonButton,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCol,
    IonRow,
    IonCard,
    IonItem,
    IonIcon,
    IonInput],
  providers: [ AuthenticationService, AngularFireAuth, AngularFireModule],
})
export class LoginPage implements OnInit {

  public email: string = "";
  public password: string = "";
  public passwordType: string = "password";
  public showHideIcon: string = "eye-outline";
  public loading: boolean = false;
  private isPasswordVisible: boolean = false;
  private disableSignInButton: boolean = false;

  constructor(
    private loginService: LoginService,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private identityService: IdentityService
  ) {
      addIcons({ eyeOutline, eyeOffOutline });
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.email = "";
    this.password= "";
    this.passwordType = "password";
    this.showHideIcon = "eye-outline";
    this.isPasswordVisible = false;
    this.disableSignInButton = false;
  }

  ionViewDidLeave() {
    this.email = "";
    this.password = "";
  }

  login() {
    if (!this.disableSignIn()) {
      this.disableSignInButton = true;
      this.loading = true;
      this.loginService.login(this.email, this.password)
      .then(auth => {
        const userDetails = { 
          displayName: auth.user?.displayName || "", 
          emailAddress: auth.user?.email || "", 
          userId: auth.user?.uid || "", 
          emailVerified: auth.user?.emailVerified || false };
        this.identityService.setUserDetails(userDetails);
        this.navCtrl.navigateForward("landing/customers");
        this.loading = false;
      })
      .catch(err => { 
        this.loading = false;
        this.presentAlert(err.code); 
      })
    }
  }

  gotoSignup() {
    this.navCtrl.navigateForward('signup');
  }

  gotoForgotPassword() {
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

  showHidePassword() {
    if (this.isPasswordVisible) {
      this.passwordType = "password";
      this.showHideIcon = "eye-outline";
      this.isPasswordVisible = false;
    }
    else {
      this.passwordType = "text";
      this.showHideIcon = "eye-off-outline";
      this.isPasswordVisible = true;
    }
  }

}
