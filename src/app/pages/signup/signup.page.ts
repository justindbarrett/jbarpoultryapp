import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonRow, IonCard, IonItem } from '@ionic/angular/standalone';
import { AuthenticationService } from 'src/app/authentication.service';
import { NavController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [ IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonRow, IonCard, IonItem ],
})
export class SignupPage implements OnInit {

  public name: string = "";
  public email: string = "";
  public password: string = "";
  private disableSignUpButton = false;

  constructor(
    private authService: AuthenticationService,
    private navCtrl: NavController,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
  }

  signUp() {
    this.disableSignUpButton = true;
    console.log('Sign Up');
    this.authService.registerUser(this.email, this.password)
    .then(auth => {
         this.navCtrl.navigateForward("login");
    })
    .catch(err => { console.log(JSON.stringify(err)); this.presentAlert(err.code); })
  }

  cancel() {
    console.log(`Nav Back`);
    this.navCtrl.navigateBack('login');
  }

  disableSignUp(): boolean {
    return !(this.name && this.email && this.password) || this.disableSignUpButton;
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

}
