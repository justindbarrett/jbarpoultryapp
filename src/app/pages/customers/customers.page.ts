import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonTextarea,
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
  IonItem,
  IonInfiniteScroll,
  IonInfiniteScrollContent } from '@ionic/angular/standalone';
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
    IonTextarea,
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
    IonItem,
    IonInfiniteScroll,
    IonInfiniteScrollContent ],
  providers: [ CustomersService ]
})
export class CustomersPage implements OnInit, OnDestroy {

  // customer list
  public showCustomerList: boolean = true;
  public searchTerm: string = "";
  public customers: Customer[] = [];
  public filteredCustomers: Customer[] = [];
  public searchFocused: boolean = false;
  public loading: boolean = true;
  public lastVisible: string | null = null;
  public hasMore: boolean = true;
  public loadingMore: boolean = false;
  private pageSize: number = 20;
  private searchDebounceTimer: any = null;
  private searchSubscription: Subscription | null = null;
  public isSearching: boolean = false;
  private currentSearchTerm: string = "";
  private searchRequestId: number = 0;

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
    // Cancel any ongoing search
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = null;
    }
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
      this.searchSubscription = null;
    }
    
    this.loading = true;
    this.isSearching = false;
    this.customers = [];
    this.filteredCustomers = [];
    this.lastVisible = null;
    this.hasMore = true;
    this.currentSearchTerm = "";
    this.loadFirstPage();
    
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

  loadFirstPage() {
    if (this.getCustomersSubscription) {
      this.getCustomersSubscription.unsubscribe();
    }
    
    this.getCustomersSubscription = this.customersService.getCustomers(this.pageSize).subscribe(
      (resp) => {
        this.customers = resp.customers;
        this.lastVisible = resp.lastVisible || null;
        this.hasMore = resp.hasMore || false;
        this.customersService.setCurrentCustomerList(this.customers);
        this.filteredCustomers = [...this.customers];
        this.loading = false;
      },
      (error) => {
        this.presentAlert("Error Retrieving Customer List", error.message, "Try Again");
        this.loading = false;
      }
    );
  }

  loadMoreCustomers(event: any) {
    if (!this.hasMore || this.loadingMore) {
      event.target.complete();
      return;
    }

    this.loadingMore = true;
    this.customersService.getCustomers(this.pageSize, this.lastVisible || undefined).subscribe(
      (resp) => {
        this.customers = [...this.customers, ...resp.customers];
        this.lastVisible = resp.lastVisible || null;
        this.hasMore = resp.hasMore || false;
        this.customersService.setCurrentCustomerList(this.customers);
        this.filteredCustomers = [...this.customers];
        this.loadingMore = false;
        event.target.complete();
      },
      (error) => {
        this.presentAlert("Error Loading More Customers", error.message, "Try Again");
        this.loadingMore = false;
        event.target.complete();
      }
    );
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
    if (this.searchSubscription)
      this.searchSubscription.unsubscribe();
    if (this.searchDebounceTimer)
      clearTimeout(this.searchDebounceTimer);
  }

  setFilteredCustomers() {
    // Clear previous timer
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    
    // If search is empty or only whitespace
    if (!this.searchTerm || this.searchTerm.trim().length === 0) {
      // Only reload if we were previously searching
      if (this.currentSearchTerm.length > 0) {
        this.currentSearchTerm = "";
        this.init();
      }
      return;
    }
    
    // Debounce search - wait 500ms after user stops typing
    this.searchDebounceTimer = setTimeout(() => {
      this.performSearch();
    }, 500);
  }
  
  performSearch() {
    if (!this.searchTerm || this.searchTerm.trim().length === 0) {
      return;
    }
    
    // Track the current search term and generate request ID
    this.currentSearchTerm = this.searchTerm.trim();
    const requestId = ++this.searchRequestId;
    
    this.isSearching = true;
    
    // Cancel previous search request
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
    
    this.searchSubscription = this.customersService.getCustomers(1000, undefined, this.currentSearchTerm).subscribe(
      (resp) => {
        // Only update if this is still the latest request
        if (requestId === this.searchRequestId) {
          this.customers = resp.customers;
          this.filteredCustomers = resp.customers;
          this.lastVisible = null;
          this.hasMore = false;
          this.customersService.setCurrentCustomerList(this.customers);
          this.isSearching = false;
        }
      },
      (error) => {
        // Only show error if this is still the latest request
        if (requestId === this.searchRequestId) {
          this.presentAlert("Error Searching Customers", error.message, "Try Again");
          this.isSearching = false;
        }
      }
    );
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
