import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonModal, IonInput, IonIcon, IonList, IonLabel, IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonRow, IonCard, IonItem } from '@ionic/angular/standalone';
import { AuthenticationService } from 'src/app/authentication.service';
import { NavController, AlertController } from '@ionic/angular';
import { IdentityService } from 'src/app/identity.service';
import { Subscription } from 'rxjs';
import { eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { LoginService } from 'src/app/login.service';
@Component({
  selector: 'app-accountsettings',
  templateUrl: './accountsettings.page.html',
  styleUrls: ['./accountsettings.page.scss'],
  standalone: true,
  imports: [ IonModal, IonInput, IonIcon, IonList, IonLabel, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonRow, IonCard, IonItem ],
})
export class AccountSettingsPage implements OnInit, OnDestroy {

  public userId: string = "";
  public userName: string = "";
  public newName: string = "";
  public userEmail: string = "";
  public newEmail: string = "";
  public password: string = "";
  public passwordType: string = "password";
  public showHideIcon: string = "eye-outline";
  private isPasswordVisible: boolean = false;
  private disableChangePasswordButton: boolean = false;
  private disableEditInfoButton: boolean = false;
  private userDetailsSubscription = new Subscription();
  private disableSignInButton: boolean = false;
  private disableSaveInfoButton: boolean = false;
  public showEdit: boolean = false;
  public openModal: boolean = false;
  public showChangePassword: boolean = false;
  public newPassword: string = "";
  public disableSavePasswordButton: boolean = false;
  @ViewChild(IonModal) modal: IonModal;

  constructor(
    private loginService: LoginService,
    private authService: AuthenticationService,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private identityService: IdentityService
  ) {
      addIcons({ eyeOutline, eyeOffOutline});
    }

  ngOnInit() {
    this.userDetailsSubscription = this.identityService.getUserDetailsObservable().subscribe((userDetails) => {
      this.userId = userDetails.userId || "";
      this.userName = userDetails.displayName || "";
      this.userEmail = userDetails.emailAddress || "";
    });
  }

  ngOnDestroy(): void {
    this.userDetailsSubscription.unsubscribe();
  }

  ionViewWillEnter() {
    this.init();
  }

  ionViewWillLeave() {
    this.init();
  }

  init() {
    this.newName = "";
    this.newEmail = "";
    this.password = "";
    this.newPassword = "";
    this.passwordType = "password";
    this.showHideIcon = "eye-outline";
    this.isPasswordVisible = false;
    this.disableChangePasswordButton = false;
    this.disableEditInfoButton = false;
    this.disableSignInButton = false;
    this.disableSaveInfoButton = false;
    this.showEdit = false;
    this.openModal = false;
    this.showChangePassword = false;
    this.disableSavePasswordButton = false;
  }

  modalDismissed(event: Event) {
    console.log(`Dismissed`);
    this.openModal = false;
    this.password = "";    
    this.passwordType = "password";
    this.showHideIcon = "eye-outline";
    this.isPasswordVisible = false;
    this.disableEditInfoButton = false;
    this.disableChangePasswordButton = false;
  }

  gotoEditUserInfo() {
    this.openModal = true;
    this.disableEditInfoButton = true;
    console.log(`edit user details`);
  }

  gotoChangePassword() {
    this.openModal = true;
    this.disableChangePasswordButton = true;
    this.showChangePassword = true;
    console.log(`change password`);
  }

  gotoEditUserPreferences() {
    console.log(`edit user preferences`);
  }

  disableEditInfo() {
    return this.disableEditInfoButton || this.disableChangePasswordButton;
  }

  disableChangePassword(): boolean {
    return this.disableChangePasswordButton || this.disableEditInfoButton;
  }

  disableEditPreferences(): boolean {
    return true;
  }

  disableSaveInfo(): boolean {
    return !(this.newName || this.newEmail) || this.disableSaveInfoButton;
  }

  disableSaveNewPassword(): boolean {
    return !(this.newPassword) || this.disableSavePasswordButton;
  }

  disableSignIn(): boolean {
    return !(this.password) || this.disableSignInButton;
  }

  async presentAlert(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Failed Sign Up Attempt',
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

  login() {
    if (!this.disableSignIn()) {
      this.disableSignInButton = true;
      this.loginService.login(this.userEmail, this.password)
      .then(auth => {
        this.password = "";
        this.showEdit = true;
        this.modal.dismiss();
      })
      .catch(err => { console.log(JSON.stringify(err)); this.presentAlert(err.code); });
    }
  }

  async saveUserInfo() {
    console.log(`save user info`);
    let nameUpdated = true;
    let emailUpdated = true;
    if (this.newName) {
      nameUpdated = false;
      await this.authService.updateUserProfile(this.newName).then(() => {
        nameUpdated = true;
        this.identityService.updateUserName(this.newName);
      }).catch((err) => {
        console.log(JSON.stringify(err)); this.presentAlert(err.code);
      });
    }
    if (this.newEmail) {
      emailUpdated = false;
      await this.authService.updateUserEmail(this.newEmail).then(() => {
        emailUpdated = true;
      }).catch((err) => {
        console.log(JSON.stringify(err)); this.presentAlert(err.code);
      });
    }
    this.showEdit = !(nameUpdated && emailUpdated);
    this.init();
  }

  async saveNewPassword() {
    this.disableSavePasswordButton = true;
    this.showEdit = false;
    this.showChangePassword = false;
  }

  cancelEditInfo() {
    this.showEdit = false;
  }

  cancelChangePassword() {
    this.showChangePassword = false;
  }

}
