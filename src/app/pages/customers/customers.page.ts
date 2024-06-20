import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonSpinner,
  IonToast,
  IonFab,
  IonFabButton,
  IonSearchbar,
  IonModal,
  IonInput,
  IonIcon,
  IonList,
  IonLabel,
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
  IonItem } from '@ionic/angular/standalone';
import { Customer } from 'src/app/models/customer.model';
import { CustomersService } from 'src/app/customers.service';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';
import { AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { IdentityService } from 'src/app/identity.service';
import { AuthenticationService } from 'src/app/authentication.service';
import { idToken } from '@angular/fire/auth';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.page.html',
  styleUrls: ['./customers.page.scss'],
  standalone: true,
  imports: [ 
    IonSpinner,
    IonToast,
    IonFab,
    IonFabButton,
    IonSearchbar,
    IonModal,
    IonInput,
    IonIcon,
    IonList,
    IonLabel,
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
    IonItem ],
  providers: [ CustomersService ]
})
export class CustomersPage implements OnInit, OnDestroy {

  // customer list
  public showCustomerList: boolean = true;
  public searchTerm: string = "";
  public customers: Customer[] = [];
  public searchFocused: boolean = false;
  public loading: boolean = true;

  // customer details
  public showCustomerDetails: boolean = false;
  public currentCustomer: Customer | null = null;
  public customerNumber: string = "";
  public customerName: string = "";
  public customerAddress: string = "";
  public customerPhone: string = "";

  // customer add
  public showAddCustomer: boolean = false;
  public newCustomerName: string = "";
  public newCustomerAddress: string = "";
  public newCustomerPhone: string = "";

  // customer edit
  public showEditCustomer: boolean = false;
  public editCustomerName: string = "";
  public editCustomerAddress: string = "";
  public editCustomerPhone: string = "";
  private editNameChanged: boolean = false;
  private editAddressChanged: boolean = false;
  private editPhoneChanged: boolean = false;

  // validation
  public disableAddCustomerSaveButton: boolean = false;
  public disableEditCustomerSaveButton: boolean = false;
  public shouldContinue: boolean = false;
  public validPhone: boolean = true;

  // toast
  public isToastOpen: boolean = false;
  public successToastMessage: string = "";

  // subscriptions
  private getCustomersSubscription: Subscription;
  private addCustomerSubscription: Subscription;
  private updateCustomerSubscription: Subscription;
  private deleteCustomerSubscription: Subscription;
  private userStableSubscription: Subscription;

  constructor(
    private alertCtrl: AlertController,
    private customersService: CustomersService,
    private identityService: IdentityService,
    private authenticationService: AuthenticationService
  ) {
    addIcons({ add });
  }

  async ngOnInit() {
    this.loading = true;
    let isStable = false;
    await this.authenticationService.getUserIdToken().then(
      (token) => {
        if (token === null || token === undefined) {
          isStable = false;
        }
        else {
          isStable = true;
        }
      }
    ).catch(
      (error) => {
        isStable = false;
    });
    
    if (isStable) {
      this.init();
    }
    else {
      this.userStableSubscription = this.identityService.getUserDetailsObservable().subscribe(
        (userDetails) => {
          this.init();
        },
        (error) => {
          this.presentAlert("Error Getting Logged In User", error.message, "Try Again");
        }
      );
    }
  }

  setSearchFocus(focused: boolean) {
    if (Capacitor.isNativePlatform()) {
      this.searchFocused = focused;
    }
  }

  init() {
    this.loading = true;
    this.getCustomersSubscription = this.customersService.getCustomers().subscribe(
      (resp) => {
        this.customers = resp.customers;
        this.customersService.setCurrentCustomerList(this.customers);
        this.loading = false;
      },
      (error) => {
        this.presentAlert("Error Retrieving Customer List", error.message, "Try Again");
        this.loading = false;
      }
    );
    this.setFilteredCustomers();
    
    this.newCustomerName = "";
    this.newCustomerAddress = "";
    this.newCustomerPhone = "";
    this.editCustomerName = "";
    this.editCustomerAddress = "";
    this.editCustomerPhone = "";
    this.currentCustomer = null;
    this.shouldContinue = false;
    this.editNameChanged = false;
    this.editAddressChanged = false;
    this.editPhoneChanged = false;
    this.disableAddCustomerSaveButton = false;
    this.disableEditCustomerSaveButton = false;
    this.shouldContinue = false;
    this.validPhone = true;
  }

  ngOnDestroy(): void {
    if (this.getCustomersSubscription)
      this.getCustomersSubscription.unsubscribe();
    if (this.addCustomerSubscription)
      this.addCustomerSubscription.unsubscribe();
    if (this.updateCustomerSubscription)
      this.updateCustomerSubscription.unsubscribe();
    if (this.deleteCustomerSubscription)
      this.deleteCustomerSubscription.unsubscribe();
    if (this.userStableSubscription)
      this.userStableSubscription.unsubscribe();
  }

  setFilteredCustomers() {
    this.customers = this.customersService.filterCustomers(this.searchTerm);
  }

  newCustomer() {
    this.resetViewControls();
    this.showAddCustomer = true;
  }

  addCustomer() {
    this.disableAddCustomerSaveButton = true;
    this.addCustomerSubscription = this.customersService.addCustomer(
      this.newCustomerName, this.newCustomerAddress, this.newCustomerPhone).subscribe(
      (resp) => {
        if (resp && resp.status === "success") {
          this.resetViewControls();
          this.showCustomerList = true;
          this.init();
          this.openSuccessToast(true, "Customer Added Successfully!");
        }
        else {
          this.presentAlert("Failed Add Customer Attempt", "Unknown Error Occurred", "Try Again");
        }
      },
      (error) => {
        this.presentAlert("Failed Add Customer Attempt", error.message, "Try Again");
      }
    );
  }

  disableAddCustomerSave() {
    return !(this.newCustomerName) || !(this.validPhone) || this.disableAddCustomerSaveButton;
  }

  cancelAddCustomer() {
    this.resetViewControls();
    this.showCustomerList = true;
    this.init();
  }

  customerDetails(customer: Customer) {
    this.resetViewControls();
    this.showCustomerDetails = true;
    this.currentCustomer = customer;
    this.customerNumber = this.currentCustomer.number;
    this.customerName = this.currentCustomer.name;
    this.customerAddress = this.currentCustomer.address;
    this.customerPhone = this.currentCustomer.phone;
  }

  cancelCustomerDetails() {
    this.resetViewControls();
    this.showCustomerList = true;
    this.init();
  }

  editCustomer() {
    this.resetViewControls();
    this.showEditCustomer = true;    
    this.editCustomerName = this.customerName;
    this.editCustomerAddress = this.customerAddress;
    this.editCustomerPhone = this.customerPhone;
  }

  async editCustomerSave() {
    this.disableEditCustomerSaveButton = true;
    if (this.currentCustomer) {
      await this.presentContinueAlert(
        `Continue?`, 
        `This action will update this customer in the system. Are you sure you want to continue?`);
      if (this.shouldContinue) {
        this.updateCustomerSubscription = this.customersService.updateCustomer(
          this.currentCustomer.id, 
          this.editCustomerName, 
          this.editCustomerAddress, 
          this.editCustomerPhone).subscribe(
          (resp) => {
            if (resp && resp.status === "success") {
              this.resetViewControls();
              this.showCustomerList = true;
              this.init();
              this.openSuccessToast(true, "Customer Updated Successfully!");
            }
            else {
              this.presentAlert("Failed Update Customer Attempt", "Unknown Error Occurred", "Try Again");
            }
          },
          (error) => {
            this.presentAlert("Failed Update Customer Attempt", error.message, "Try Again");
          }
        );
      }
    }
    else {
      this.presentAlert("Failed Update Customer Attempt", "Current Customer is not Defined", "Try Again");
      this.cancelCustomerDetails();
    }
  }

  async deleteCustomer() {
    if (this.currentCustomer) {
      await this.presentContinueAlert(`Continue?`, `This action will remove this customer from the system. Are you sure you want to continue?`);
      if (this.shouldContinue) {
        this.deleteCustomerSubscription = this.customersService.deleteCustomer(this.currentCustomer.id).subscribe(
          (resp) => {
            if (resp && resp.status === "success") {
              this.resetViewControls();
              this.showCustomerList = true;
              this.init();
              this.openSuccessToast(true, "Customer Deleted Successfully!");
            }
            else {
              this.presentAlert("Failed Delete Customer Attempt", "Unknown Error Occurred", "Try Again");
            }
          },
          (error) => {
            this.presentAlert("Failed Delete Customer Attempt", error, "Try Again");
          }
        );
      }
    }
    else {
      this.presentAlert("Failed Delete Customer Attempt", "Current Customer is not defined", "Try Again");
      this.cancelCustomerDetails();
    }
  }

  disableEditCustomerSave() {
    return !((this.editCustomerName) 
    && (this.editNameChanged || this.editAddressChanged || this.editPhoneChanged))
    || !(this.validPhone)
    || this.disableEditCustomerSaveButton;
  }

  cancelEditCustomer() {
    this.resetViewControls();
    this.showCustomerDetails = true;
    this.validPhone = true;
  }

  nameChanged() {
    this.editNameChanged = (this.editCustomerName !== this.customerName);
  }

  addressChanged() {
    this.editAddressChanged = (this.editCustomerAddress !== this.customerAddress);
  }

  phoneChanged(event: any) {
    const value = event.target!.value;
    const filteredValue = value.replace(/\D[^\.]/g, "");
    const formattedNumber = filteredValue.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');

    this.newCustomerPhone = this.editCustomerPhone = formattedNumber;

    const phoneRegex = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/g;
    this.validPhone = phoneRegex.test(this.newCustomerPhone) || (this.newCustomerPhone == "") || phoneRegex.test(this.editCustomerPhone) || (this.editCustomerPhone == "");

    this.editPhoneChanged = (this.editCustomerPhone !== this.customerPhone);
  }


  resetViewControls() {
    this.showCustomerList = false;
    this.showAddCustomer = false;
    this.showCustomerDetails = false;
    this.showEditCustomer = false;
  }

  async presentAlert(header: string, message: string, buttonText: string) {
    const alert = await this.alertCtrl.create({
      header: header,
      message: message,
      buttons: [buttonText],
    });

    await alert.present();

    await alert.onDidDismiss().then(() => {
      this.disableAddCustomerSaveButton = false;
      this.disableEditCustomerSaveButton = false;
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
            this.disableEditCustomerSaveButton = false;
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

  openSuccessToast(open: boolean, message: string) {
    this.successToastMessage = message;
    this.isToastOpen = open;
  }
}
