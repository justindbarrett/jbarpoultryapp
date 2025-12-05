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
import { PdfGeneratorService } from 'src/app/pdfGenerator.service';
import { Lot } from 'src/app/models/lot.model';
import { format } from 'date-fns/format';

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
  public currentDate: string = "";

  // Accordion management (optional)
  accordionValue: string = 'core'; // Keeps the first section open by default

  private shouldContinue: boolean = false;
  public loading: boolean = true;
  public presentingElement: HTMLElement;
  private userStableSubscription: Subscription;

  // toast
  public isToastOpen: boolean = false;
  public successToastMessage: string = "";

  // Example data structure that combines fields from your form
  public mockLotSchedule: Lot[] = [
    {
      id: 'lot1',
      processDate: '2024-06-15',
      customer: {
        id: 'cust1',
        number: 'CUST-001',
        name: 'John Doe',
        phone: '555-1234',
        address: '123 Farm Rd'
      },
      timeIn: '08:00 AM',
      withdrawalMet: true,
      isOrganic: false,
      lotNumber: 'LOTA-001',
      species: 'Broiler',
      customerCount: 150,
      processingInstructions: {
        wholeBirds: 100,
        cutUpBirds: 50,
        halves: 0,
        sixPiece: 25,
        eightPiece: 25,
        notes: 'Quick chill required'
      },
      anteMortemTime: '11:00 AM',
      fsisInitial: 'JD',
      finalCount: 148
    },
    {
      id: 'lot2',
      processDate: '2024-06-15',
      customer: {
        id: 'cust2',
        number: 'CUST-002',
        name: 'Jane Smith',
        phone: '555-5678',
        address: '456 Ranch St'
      },
      timeIn: '09:30 AM',
      withdrawalMet: false,
      isOrganic: true,
      lotNumber: 'LOTB-002',
      species: 'Turkey',
      customerCount: 80,
      processingInstructions: {
        wholeBirds: 80,
        cutUpBirds: 0,
        halves: 0,
        sixPiece: 0,
        eightPiece: 0,
        notes: 'Handle with care'
      },
      anteMortemTime: '12:30 PM',
      fsisInitial: 'JS',
      finalCount: 80
    },
    // ... add more lots, up to 8 ...
  ];

  constructor(
    private navCtrl: NavController,
    private ionRouterOutlet: IonRouterOutlet,
    private customersService: CustomersService,
    private alertCtrl: AlertController,
    private identityService: IdentityService,
    private authenticationService: AuthenticationService,
    private pdfGeneratorService: PdfGeneratorService ) {
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
    this.currentDate = format(new Date(), 'EEEE, MMMM d, yyyy');
    this.customersService.getCustomers().subscribe(
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

  generateSchedule() {
    this.pdfGeneratorService.generateDailySchedule(this.mockLotSchedule);
  }

  generateLotLabels() {
    this.pdfGeneratorService.generateLotLabelsPdf(this.mockLotSchedule);
  }

  onLotSelected(lot: Lot) {
    console.log('Lot selected:', lot);
    // Navigate to detail page and pass the lot in navigation state
    try {
      this.navCtrl.navigateForward(`/landing/lots/${lot.id}`, { state: { lot } });
    } catch (e) {
      console.error('Navigation failed', e);
    }
  }
}
