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
import { NavController, AlertController } from '@ionic/angular';
import { eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
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
    IonInput ],
})
export class SignupPage implements OnInit {

  public name: string = "";
  public email: string = "";
  public password: string = "";
  public creationCode: string = "";
  public passwordType: string = "password";
  public codeType: string = "password";
  public showHideIconPassword: string = "eye-outline";
  public showHideIconCode: string = "eye-outline";
  public loading: boolean = false;
  private isPasswordVisible: boolean = false;
  private isCodeVisible: boolean = false;
  private disableSignUpButton = false;
  private remainingAttempts = 5;

  constructor(
    private authService: AuthenticationService,
    private navCtrl: NavController,
    private alertCtrl: AlertController
  ) {
    addIcons({ eyeOutline, eyeOffOutline });
  }

  ngOnInit() {
  }

  signUp() {
    if (!this.disableSignUp()) {
      this.disableSignUpButton = true;
      this.loading = true;
  
      // handle remaining attempts and disabling for some time use IP address/device ID, needs to be done on api?
      if (this.remainingAttempts <= 0) {
        this.loading = false;
        return;
      }
  
      // TODO: store this code as a 10 digit secret
      if (this.creationCode == "4515432926") {
        this.authService.registerUser(this.email, this.password)
        .then(result => {
          result.user?.updateProfile({ displayName: this.name });
          this.navCtrl.navigateForward("login");
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
          this.presentAlert(err.code); 
        })
      }
      else {
        this.loading = false;
        this.remainingAttempts = this.remainingAttempts - 1;
        this.presentAlert(`Invalid account creation code. ${this.remainingAttempts} attempts remaining.`);
      }
    }
  }

  cancel() {
    this.navCtrl.navigateBack('login');
  }

  disableSignUp(): boolean {
    return !(this.name && this.email && this.password && this.creationCode) || this.disableSignUpButton;
  }

  async presentAlert(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Failed Sign Up Attempt',
      message: message,
      buttons: ['Try Again'],
    });

    await alert.present();

    await alert.onDidDismiss().then(() => {
      this.disableSignUpButton = false;
    });
  }

  showHidePassword() {
    if (this.isPasswordVisible) {
      this.passwordType = "password";
      this.showHideIconPassword = "eye-outline";
      this.isPasswordVisible = false;
    }
    else {
      this.passwordType = "text";
      this.showHideIconPassword = "eye-off-outline";
      this.isPasswordVisible = true;
    }
  }

  showHideCode() {
    if (this.isCodeVisible) {
      this.codeType = "password";
      this.showHideIconCode = "eye-outline";
      this.isCodeVisible = false;
    }
    else {
      this.codeType = "text";
      this.showHideIconCode = "eye-off-outline";
      this.isCodeVisible = true;
    }
  }

}
