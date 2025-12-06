import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonModal, IonInput, IonIcon, IonList, IonLabel, IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonRow, IonCard, IonItem } from '@ionic/angular/standalone';
import { AuthenticationService } from 'src/app/authentication.service';
import { UsersService } from 'src/app/users.service';
import { DailyCodeService } from 'src/app/dailyCode.service';
import { User } from 'src/app/models/user.model';
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
  public userInitials: string[] = [];
  public activeInitials: string = "";
  public userRole: string = "";
  public dailyCode: string = "";
  public dailyCodeDate: string = "";

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
  public newInitials: string = "";
  public disableSavePasswordButton: boolean = false;
  public shouldContinue: boolean = false;
  public userDocId: string = "";
  public initialsChanged: boolean = false;
  @ViewChild(IonModal) modal: IonModal;

  constructor(
    private loginService: LoginService,
    private authService: AuthenticationService,
    private usersService: UsersService,
    private dailyCodeService: DailyCodeService,
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

    // Load user data from database
    if (this.userId) {
      this.usersService.getUserByUserId(this.userId).subscribe({
        next: (response) => {
          this.userInitials = response.data.initials || [];
          this.activeInitials = this.userInitials[0] || "";
          this.userRole = response.data.role || "";
          this.userDocId = response.data.id || "";
          
          // Fetch daily code if user is admin
          if (this.userRole === 'admin') {
            this.dailyCodeService.getCurrentCode().subscribe({
              next: (codeResponse) => {
                this.dailyCode = codeResponse.data.code;
                this.dailyCodeDate = codeResponse.data.date;
              },
              error: (err) => {
                console.error('Error loading daily code:', err);
              }
            });
          }
        },
        error: (err) => {
          console.error('Error loading user data:', err);
        }
      });
    }

    this.userDetailsSubscription = this.identityService.getUserDetailsObservable().subscribe((userDetails) => {
      this.userId = userDetails.userId || "";
      this.userName = userDetails.displayName || "";
      this.userEmail = userDetails.emailAddress || "";
      
      // Reload user data from database when userId changes
      if (this.userId) {
        this.usersService.getUserByUserId(this.userId).subscribe({
          next: (response) => {
            this.userInitials = response.data.initials || [];
            this.activeInitials = this.userInitials[0] || "";
            this.userRole = response.data.role || "";
            this.userDocId = response.data.id || "";
            
            // Fetch daily code if user is admin
            if (this.userRole === 'admin') {
              this.dailyCodeService.getCurrentCode().subscribe({
                next: (codeResponse) => {
                  this.dailyCode = codeResponse.data.code;
                  this.dailyCodeDate = codeResponse.data.date;
                },
                error: (err) => {
                  console.error('Error loading daily code:', err);
                }
              });
            }
          },
          error: (err) => {
            console.error('Error loading user data:', err);
          }
        });
      }
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
    this.initialsChanged = false;
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

  addInitials() {
    if (!this.newInitials.trim()) {
      return;
    }

    const initialsToAdd = this.newInitials
      .split(',')
      .map(i => i.trim().toUpperCase())
      .filter(i => i.length > 0 && !this.userInitials.includes(i));

    if (initialsToAdd.length === 0) {
      this.presentAlert('Invalid Input', 'Please enter new initials or remove duplicates', 'OK');
      return;
    }

    const updatedInitials = [...this.userInitials, ...initialsToAdd];

    this.usersService.updateUser(this.userDocId, { initials: updatedInitials }).subscribe({
      next: (response) => {
        this.userInitials = response.data.initials || [];
        this.newInitials = "";
        this.initialsChanged = true;
        if (!this.activeInitials && this.userInitials.length > 0) {
          this.activeInitials = this.userInitials[0];
        }
        this.presentAlert('Success', `Added ${initialsToAdd.length} initial(s) successfully`, 'OK');
      },
      error: (err) => {
        console.error('Error updating initials:', err);
        this.presentAlert('Error', 'Failed to update initials', 'OK');
      }
    });
  }

  deleteInitials(initials: string) {
    const updatedInitials = this.userInitials.filter(i => i !== initials);

    this.usersService.updateUser(this.userDocId, { initials: updatedInitials }).subscribe({
      next: (response) => {
        this.userInitials = response.data.initials || [];
        this.initialsChanged = true;
        if (this.activeInitials === initials) {
          this.activeInitials = this.userInitials[0] || "";
        }
        this.presentAlert('Success', 'Initials deleted successfully', 'OK');
      },
      error: (err) => {
        console.error('Error deleting initials:', err);
        this.presentAlert('Error', 'Failed to delete initials', 'OK');
      }
    });
  }

  setActiveInitials(initials: string) {
    const index = this.userInitials.indexOf(initials);
    if (index > 0) {
      const reorderedInitials = [
        initials,
        ...this.userInitials.filter(i => i !== initials)
      ];

      this.usersService.updateUser(this.userDocId, { initials: reorderedInitials }).subscribe({
        next: (response) => {
          this.userInitials = response.data.initials || [];
          this.activeInitials = this.userInitials[0] || "";
          this.initialsChanged = true;
          this.presentAlert('Success', 'Active initials updated successfully', 'OK');
        },
        error: (err) => {
          console.error('Error setting active initials:', err);
          this.presentAlert('Error', 'Failed to set active initials', 'OK');
        }
      });
    } else {
      this.activeInitials = initials;
    }
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
    let initialsUpdated = true;
    
    if (this.newInitials && this.newInitials.trim()) {
      initialsUpdated = false;
      this.addInitials();
      // Wait a moment for the subscription to complete
      setTimeout(() => {
        initialsUpdated = true;
      }, 500);
    }
    
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
    this.showEdit = !(nameUpdated && emailUpdated && initialsUpdated);
    if (!this.showEdit) {
      this.initialsChanged = false;
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
