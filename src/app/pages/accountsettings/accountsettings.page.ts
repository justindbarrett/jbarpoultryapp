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
  public userEmail: string = "";

  public newName: string = "";
  public newEmail: string = "";
  public newEmailConfirm: string = "";

  public password: string = "";
  public newPassword: string = "";
  public newPasswordConfirm: string = "";
  public passwordType: string = "password";
  public passwordNewType: string = "password";
  public passwordConfirmType: string = "password";
  private isPasswordVisible: boolean = false;
  private isNewPasswordVisible: boolean = false;
  private isConfirmPasswordVisible: boolean = false;
  public showHideIcon: string = "eye-outline";
  public showHideIconNew: string = "eye-outline";
  public showHideIconConfirm: string = "eye-outline";

  private disableChangePasswordButton: boolean = false;
  private disableEditInfoButton: boolean = false;
  private userDetailsSubscription = new Subscription();
  private disableSignInButton: boolean = false;
  private disableSaveInfoButton: boolean = false;
  public showEdit: boolean = false;
  public openModal: boolean = false;
  public showChangePassword: boolean = false;
  public showVerifyEmail: boolean = false;
  public disableSavePasswordButton: boolean = false;
  public shouldContinue: boolean = false;
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
    const userDetails = this.identityService.getUserDetails();
    this.userId = userDetails?.userId || "";
    this.userName = userDetails?.displayName || "";
    this.userEmail = userDetails?.emailAddress || "";

    this.userDetailsSubscription = this.identityService.getUserDetailsObservable().subscribe((userDetails) => {
      this.userId = userDetails.userId || "";
      this.userName = userDetails.displayName || "";
      this.userEmail = userDetails.emailAddress || "";
    });
  }

  ngOnDestroy(): void {
    this.userDetailsSubscription.unsubscribe();
  }

  init() {
    this.newName = "";
    this.newEmail = "";
    this.newEmailConfirm = "";
    this.password = "";
    this.newPassword = "";
    this.newPasswordConfirm = "";
    this.passwordType = "password";
    this.passwordConfirmType = "password";
    this.showHideIcon = "eye-outline";
    this.isPasswordVisible = false;
    this.isNewPasswordVisible = false;
    this.isConfirmPasswordVisible = false;
    this.disableChangePasswordButton = false;
    this.disableEditInfoButton = false;
    this.disableSignInButton = false;
    this.disableSaveInfoButton = false;
    this.showEdit = false;
    this.openModal = false;
    this.showChangePassword = false;
    this.disableSavePasswordButton = false;
    this.shouldContinue = false;
  }

  modalDismissed(event: Event) {
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
  }

  gotoChangePassword() {
    this.openModal = true;
    this.disableChangePasswordButton = true;
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
    return !(this.newPassword && this.newPasswordConfirm) || this.disableSavePasswordButton;
  }

  disableSignIn(): boolean {
    return !(this.password) || this.disableSignInButton;
  }

  async presentAlert(header: string, message: string, buttonText: string) {
    const alert = await this.alertCtrl.create({
      header: header,
      message: message,
      buttons: [buttonText],
    });

    await alert.present();

    await alert.onDidDismiss().then(() => {
      this.disableSignInButton = false;
      this.disableSaveInfoButton = false;
      this.disableSavePasswordButton = false;
    });
  }

  async presentContinueAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header: header,
      message: message,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            this.shouldContinue = false;            
            this.disableSaveInfoButton = false;
            this.disableSavePasswordButton = false;
          },
        },
        {
          text: 'Continue',
          role: 'confirm',
          handler: () => {
            this.shouldContinue = true;
          },
        },
      ]
    });

    await alert.present();

    await alert.onDidDismiss().then(() => {
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

  showHideNewPassword() {
    if (this.isNewPasswordVisible) {
      this.passwordNewType = "password";
      this.showHideIconNew = "eye-outline";
      this.isNewPasswordVisible = false;
    }
    else {
      this.passwordNewType = "text";
      this.showHideIconNew = "eye-off-outline";
      this.isNewPasswordVisible = true;
    }
  }

  showHideConfirmPassword() {
    if (this.isConfirmPasswordVisible) {
      this.passwordConfirmType = "password";
      this.showHideIconConfirm = "eye-outline";
      this.isConfirmPasswordVisible = false;
    }
    else {
      this.passwordConfirmType = "text";
      this.showHideIconConfirm = "eye-off-outline";
      this.isConfirmPasswordVisible = true;
    }
  }

  login() {
    if (!this.disableSignIn()) {
      this.disableSignInButton = true;
      this.loginService.login(this.userEmail, this.password)
      .then(auth => {
        this.password = "";
        if (this.disableEditInfoButton) {
          this.showEdit = true;
        }
        if (this.disableChangePasswordButton) {
          this.showChangePassword = true;
        }
        this.modal.dismiss();
      })
      .catch(err => {this.presentAlert('Failed SignIn Attempt', err.code, 'Try Again'); });
    }
  }

  async saveUserInfo() {
    this.disableSaveInfoButton = true;
    let nameUpdated = true;
    let emailUpdated = true;
    if (this.newName) {
      nameUpdated = false;
      await this.authService.updateUserProfile(this.newName).then(() => {
        nameUpdated = true;
        this.identityService.updateUserName(this.newName);
      }).catch((err) => {
        this.presentAlert(`Failed Edit User Info Attempt`, err.code, `Try Again`);
      });
    }
    if (this.newEmail) {
      emailUpdated = false;
      if (this.newEmailConfirm === this.newEmail) {
        await this.presentContinueAlert(`Continue?`, `This action will sign you out immediately. You will need to verify your new email and sign in again with your new credentials. Would you like to continue?`);
        if (this.shouldContinue) {
          await this.authService.updateUserEmail(this.newEmail).then(() => {
            emailUpdated = true; 
            this.authService.logOutUser()
            .then(auth => {
              emailUpdated = false;
              this.identityService.clearUserDetails();
              this.navCtrl.navigateBack("login");
            }).catch((err) => { 
              this.presentAlert(`Failed SignOut Attempt`, err, `Try Again`); 
            });
          }).catch((err) => {
            this.presentAlert(`Failed Edit User Info Attempt`, err.code, `Try Again`);
          });
        }
      }
      else {
        this.presentAlert(`Confirm New Email`, `Emails must match.`, `Try Again`);
      }
    }
    this.showEdit = !(nameUpdated && emailUpdated);
    if (!this.showEdit) {
      this.init();
    }
  }

  async saveNewPassword() {
    this.disableSavePasswordButton = true;
    let passwordUpdated = false;
    if (this.newPassword === this.newPasswordConfirm) {
      await this.presentContinueAlert(`Continue?`, `This action will sign you out immediately. You will need to sign in again with your new credentials. Would you like to continue?`);
      if (this.shouldContinue) {
        await this.authService.updateUserPassword(this.newPassword).then(() => {
          passwordUpdated = true; 
          this.authService.logOutUser()
          .then(auth => {
            passwordUpdated = false;
            this.identityService.clearUserDetails();
            this.navCtrl.navigateBack("login");
          }).catch((err) => { 
            this.presentAlert(`Failed SignOut Attempt`, err, `Try Again`); 
          });
        }).catch((err) => {
          this.presentAlert(`Failed Change Password Attempt`, err.code, `Try Again`);
        });
      }
    }
    else {
      this.presentAlert(`Confirm New Password`, `Passwords must match.`, `Try Again`);
    }
    this.showChangePassword = !passwordUpdated;
    if (!this.showChangePassword) {
      this.init();
    }
  }

  cancelEditInfo() {
    this.showEdit = false;
    this.init();
  }

  cancelChangePassword() {
    this.showChangePassword = false;
    this.init();
  }

}
