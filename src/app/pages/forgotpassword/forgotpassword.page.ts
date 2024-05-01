import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonRow, IonCard, IonItem } from '@ionic/angular/standalone';
import { AuthenticationService } from 'src/app/authentication.service';
import { NavController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.page.html',
  styleUrls: ['./forgotpassword.page.scss'],
  standalone: true,
  imports: [ IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonRow, IonCard, IonItem ],
})
export class ForgotpasswordPage implements OnInit {

  public email: string = "";
  private disableSendResetButton = false;

  constructor(
    private authService: AuthenticationService,
    private navCtrl: NavController,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
  }

  sendReset() {
    if (!this.disableSendReset()) {
      this.disableSendResetButton = true;
      console.log('send reset');
      this.authService.resetPassword(this.email)
      .then(auth => {
        this.navCtrl.navigateForward("login");
      })
      .catch(err => { console.log(JSON.stringify(err)); this.presentAlert(err.code); })
    }
  }

  cancel() {
    console.log(`Nav Back`);
    this.navCtrl.navigateBack('login');
  }

  disableSendReset(): boolean {
    return !this.email || this.disableSendResetButton;
  }

  async presentAlert(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Failed Sign Up Attempt',
      message: message,
      buttons: ['Try Again'],
    });

    await alert.present();

    await alert.onDidDismiss().then(() => {
      this.disableSendResetButton = false;
    });
  }

}
