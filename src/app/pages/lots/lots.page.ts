import { 
  IonSpinner,
  IonToast, 
  IonToggle, 
  IonText, 
  IonDatetime, 
  IonButtons, 
  IonRouterOutlet, 
  IonSegment, 
  IonSegmentButton, 
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
  IonAccordion,
  IonDatetimeButton,
  IonSelectOption,
  IonAccordionGroup } from '@ionic/angular/standalone';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Customer } from 'src/app/models/customer.model';
import { CustomersService } from 'src/app/customers.service';
import { addIcons } from 'ionicons';
import { add, arrowBack, arrowForward, checkmarkCircle, radioButtonOff } from 'ionicons/icons';
import { AlertController } from '@ionic/angular';
import { NgCalendarModule } from 'ionic7-calendar';
import { IonicSelectableComponent } from 'ionic-selectable';
import { Subscription } from 'rxjs';
import { IdentityService } from 'src/app/identity.service';
import { AuthenticationService } from 'src/app/authentication.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-lots',
  templateUrl: './lots.page.html',
  styleUrls: ['./lots.page.scss'],
  standalone: true,
  imports: [ 
    IonSpinner,
    IonToast, 
    IonToggle, 
    IonText, 
    IonDatetime, 
    IonicSelectableComponent, 
    IonButtons, 
    IonRouterOutlet, 
    NgCalendarModule, 
    IonSegment, 
    IonSegmentButton, 
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
    IonDatetime,
    IonAccordion,
    IonDatetimeButton,
    IonSelectOption,
    IonAccordionGroup,
    IonAccordionGroup],
  providers: [ CustomersService ]
})
export class LotsPage implements OnInit, OnDestroy {
  @ViewChild('modal') newLotModal: IonModal;

  public newLot: any = {
    title: "",
    allDay: false,
    startTime: null,
    endTime: null,
    customerId: "",
    lotId: "",
    id: "",
  };
  public customers: Customer[] = [];
  public customer: Customer | undefined = undefined;
  poultryTypes: string[] = ['Broiler', 'Layer', 'Turkey', 'Duck', 'Quail', 'Other'];

  // Accordion management (optional)
  accordionValue: string = 'core'; // Keeps the first section open by default
  
  private shouldContinue: boolean = false;
  public loading: boolean = true;
  public presentingElement: HTMLElement;
  private userStableSubscription: Subscription;

  // toast
  public isToastOpen: boolean = false;
  public successToastMessage: string = "";

  constructor(
    private navCtrl: NavController,
    private ionRouterOutlet: IonRouterOutlet,
    private customersService: CustomersService,
    private alertCtrl: AlertController,
    private identityService: IdentityService,
    private authenticationService: AuthenticationService  ) {
    addIcons({ add, arrowBack, arrowForward, radioButtonOff, checkmarkCircle });
    this.presentingElement = this.ionRouterOutlet.nativeEl;
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

  ngOnDestroy(): void {
    if (this.userStableSubscription)
      this.userStableSubscription.unsubscribe();
  }

  init() {
    this.loading = true;
    this.customersService.getCustomers().subscribe(
      (resp) => {
      this.customers = resp.customers;
      this.customersService.setCurrentCustomerList(this.customers);
      },
      (error) => {
        this.presentAlert("Error Retrieving Customer List", error.message, "Try Again");
        this.loading = false;
      }
    );
  }

  addLot() {
    this.navCtrl.navigateForward('/landing/lots/new-lot');
  }

  disableAddLot() {
    return false;
  }

  customerChange(event: {
    component: IonicSelectableComponent,
    value: Customer
  }) {
    this.customer = event.value;
  }

  modalDismissed() {
    this.customer = undefined;
  }

  async presentAlert(header: string, message: string, buttonText: string) {
    const alert = await this.alertCtrl.create({
      cssClass: 'alertOverModal',
      header: header,
      message: message,
      buttons: [buttonText],
    });

    await alert.present();

    await alert.onDidDismiss().then(() => {
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
