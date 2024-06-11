import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonFab, IonFabButton, IonSearchbar, IonModal, IonInput, IonIcon, IonList, IonLabel, IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonRow, IonCard, IonItem } from '@ionic/angular/standalone';
import { Customer } from 'src/app/models/customer.model';
import { CustomersService } from 'src/app/customers.service';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.page.html',
  styleUrls: ['./customers.page.scss'],
  standalone: true,
  imports: [ IonFab, IonFabButton, IonSearchbar, IonModal, IonInput, IonIcon, IonList, IonLabel, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonRow, IonCard, IonItem ],
  providers: [ CustomersService ]
})
export class CustomersPage implements OnInit, OnDestroy {

  public searchTerm: string = "";
  public customers: Customer[] = [];
  public customerNumber: string = "";
  public customerName: string = "";
  public customerAddress: string = "";
  public customerPhone: string = "";
  public newCustomerName: string = "";
  public newCustomerAddress: string = "";
  public newCustomerPhone: string = "";
  public showCustomerList: boolean = true;
  public showAddCustomer: boolean = false;
  public showCustomerDetails: boolean = false;
  public showEditCustomer: boolean = false;
  public currentCustomer: Customer | null = null;
  public shouldContinue: boolean = false;
  public disableAddCustomerSaveButton: boolean = false;
  public disableEditCustomerSaveButton: boolean = false;
  private editNameChanged: boolean = false;
  private editAddressChanged: boolean = false;
  private editPhoneChanged: boolean = false;

  constructor(
    private alertCtrl: AlertController,
    private customersService: CustomersService
  ) {
    addIcons({ add });
  }

  ngOnInit() {
    this.init();
  }

  init() {
    this.customersService.getCustomers().subscribe(resp => {
      this.customers = resp.customers;
      this.customersService.setCurrentCustomerList(this.customers);
    });
    this.setFilteredCustomers();
    
    this.newCustomerName = "";
    this.newCustomerAddress = "";
    this.newCustomerPhone = "";
    this.currentCustomer = null;
    this.shouldContinue = false;
  }

  ngOnDestroy(): void {
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
    this.customersService.addCustomer(this.newCustomerName, this.newCustomerAddress, this.newCustomerPhone).subscribe(
      (resp) => {
        console.log(resp);
        if (resp !== null && resp !== undefined) {
          this.resetViewControls();
          this.showCustomerList = true;
          this.init();
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  customerDetails(customer: Customer) {
    this.showCustomerList = false;
    this.showCustomerDetails = true;
    this.currentCustomer = customer;
    this.customerNumber = this.currentCustomer.number;
    this.customerName = this.currentCustomer.data.name;
    this.customerAddress = this.currentCustomer.data.address;
    this.customerPhone = this.currentCustomer.data.phone;
    console.log(JSON.stringify(this.currentCustomer));
  }

  cancelAddCustomer() {
    this.resetViewControls();
    this.showCustomerList = true;
    this.init();
  }

  editCustomer() {
    this.resetViewControls();
    this.showEditCustomer = true;    
  }

  async editCustomerSave() {
    this.disableEditCustomerSaveButton = true;
    if (this.currentCustomer) {
      await this.presentContinueAlert(`Continue?`, `This action will update this customer in the system. Are you sure you want to continue?`);
      if (this.shouldContinue) {
        this.customersService.updateCustomer(this.currentCustomer.id, this.customerName, this.customerAddress, this.customerPhone).subscribe(
          (resp) => {
            if (resp !== null && resp !== undefined && resp.status === "success") {
              this.resetViewControls();
              this.showCustomerDetails = true;
              this.init();
            }
            else {
              this.presentAlert("Failed Update Customer Attempt", "Unknown Error Occurred", "Try Again");
            }
          },
          (error) => {
            this.presentAlert("Failed Update Customer Attempt", error, "Try Again");
          }
        );
      }
    }
    else {
      this.presentAlert("Failed Update Customer Attempt", "Current Customer is not Defined", "Try Again");
      this.cancelCustomerDetails();
    }
  }

  nameChanged() {
    console.log(`Name Changed`)
    this.editNameChanged = true;
  }

  addressChanged() {
    console.log(`Address Changed`)
    this.editAddressChanged = true;
  }

  phoneChanged() {
    console.log(`Phone Changed`)
    this.editPhoneChanged = true;
  }

  cancelEditCustomer() {
    this.resetViewControls();
    this.showCustomerDetails = true;
  }

  async deleteCustomer() {
    if (this.currentCustomer) {
      await this.presentContinueAlert(`Continue?`, `This action will remove this customer from the system. Are you sure you want to continue?`);
      if (this.shouldContinue) {
        this.customersService.deleteCustomer(this.currentCustomer.id).subscribe(
          (resp) => {
            if (resp !== null && resp !== undefined && resp.status === "success") {
              this.resetViewControls();
              this.showCustomerList = true;
              this.init();
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
      this.presentAlert("Failed Delete Customer Attempt", "Current Customer is not Defined", "Try Again");
      this.cancelCustomerDetails();
    }
  }

  cancelCustomerDetails() {
    this.resetViewControls();
    this.showCustomerList = true;
  }

  resetViewControls() {
    this.showCustomerList = false;
    this.showAddCustomer = false;
    this.showCustomerDetails = false;
    this.showEditCustomer = false;
  }

  disableAddCustomerSave() {
    return !(this.newCustomerName) || this.disableAddCustomerSaveButton;
  }

  disableEditCustomerSave() {
    return !(!(this.customerName) && !(this.editNameChanged || this.editAddressChanged || this.editPhoneChanged )) || this.disableEditCustomerSaveButton;
  }


  async presentAlert(header: string, message: string, buttonText: string) {
    const alert = await this.alertCtrl.create({
      header: header,
      message: message,
      buttons: [buttonText],
    });

    await alert.present();

    await alert.onDidDismiss().then(() => {
      //this.disableSignInButton = false;
      //this.disableSaveInfoButton = false;
      //this.disableSavePasswordButton = false;
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
            //this.disableSaveInfoButton = false;
            //this.disableSavePasswordButton = false;
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
}
