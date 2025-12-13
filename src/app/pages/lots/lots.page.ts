import { 
  IonSpinner,
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
  IonSelect,
  IonAccordionGroup,
  IonItemSliding,
  IonItemOptions,
  IonItemOption } from '@ionic/angular/standalone';
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
import { Consts } from 'src/app/consts';
import { LotsService } from 'src/app/lots.service';
import { UsersService } from 'src/app/users.service';

@Component({
  selector: 'app-lots',
  templateUrl: './lots.page.html',
  styleUrls: ['./lots.page.scss'],
  standalone: true,
  imports: [ 
    IonSpinner,
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
    IonSelect,
    IonAccordionGroup,
    IonItemSliding,
    IonItemOptions,
    IonItemOption],
  providers: [ CustomersService ]
})
export class LotsPage implements OnInit, OnDestroy {
  @ViewChild('modal') newLotModal: IonModal;

  public newLotCustomer: Customer | undefined = undefined;
  public newLotSpecies: string = '';
  public customers: Customer[] = [];
  public customer: Customer | undefined = undefined;
  poultryTypes: string[] = Consts.SPECIES_TYPES;
  public currentDate: string = "";

  private shouldContinue: boolean = false;
  public loading: boolean = true;
  public presentingElement: HTMLElement;
  private userStableSubscription: Subscription;



  // Lots data
  public lots: Lot[] = [];
  public userRole: string = '';
  private isInitializing: boolean = false;
  private hasEnteredView: boolean = false;

  constructor(
    private navCtrl: NavController,
    private ionRouterOutlet: IonRouterOutlet,
    private customersService: CustomersService,
    private lotsService: LotsService,
    private usersService: UsersService,
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
      this.fetchUserRole();
    }
    else {
      this.userStableSubscription = this.identityService.getUserDetailsObservable().subscribe(
        (userDetails) => {
          this.init();
          this.fetchUserRole();
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

  ionViewWillEnter() {
    // Only refresh data on subsequent entries, not the first one (which ngOnInit handles)
    if (this.hasEnteredView && !this.isInitializing && !this.loading) {
      this.init();
    }
    this.hasEnteredView = true;
  }

  init() {
    if (this.isInitializing) {
      return; // Prevent concurrent init calls
    }
    
    this.isInitializing = true;
    this.loading = true;
    this.currentDate = format(new Date(), 'EEEE, MMMM d, yyyy');
    const todayDateStr = format(new Date(), 'yyyy-MM-dd');
    
    this.customersService.getCustomers().subscribe(
      (resp) => {
        this.customers = resp.customers;
        this.customersService.setCurrentCustomerList(this.customers);
        
        // Fetch lots after customers are loaded
        this.lotsService.getLots().subscribe(
          (lotsResp) => {
            // Filter lots for today's date and sort by lot number
            this.lots = lotsResp.lots
              .filter(lot => lot.processDate === todayDateStr)
              .sort((a, b) => {
                if (a.lotNumber && b.lotNumber) {
                  return a.lotNumber.localeCompare(b.lotNumber);
                }
                return 0;
              });
            this.loading = false;
            this.isInitializing = false;
          },
          (error) => {
            this.presentAlert("Error Retrieving Lots", error.message, "Try Again");
            this.loading = false;
            this.isInitializing = false;
          }
        );
      },
      (error) => {
        this.presentAlert("Error Retrieving Customer List", error.message, "Try Again");
        this.loading = false;
        this.isInitializing = false;
      }
    );
  }

  addLot() {
    if (!this.newLotCustomer || !this.newLotSpecies) {
      this.presentAlert('Missing Information', 'Please select both customer and species.', 'OK');
      return;
    }

    const now = new Date();
    const todayDateStr = format(now, 'yyyy-MM-dd');
    const timeInStr = format(now, 'HH:mm:ss');

    const newLot: Lot = {
      id: '', // Backend will set this
      processDate: todayDateStr,
      customer: this.newLotCustomer,
      timeIn: timeInStr,
      withdrawalMet: false,
      isOrganic: false,
      lotNumber: '', // Backend will auto-generate this
      species: this.newLotSpecies,
      customerCount: 0,
      processingInstructions: {
        wholeBirds: 0,
        cutUpBirds: 0,
        halves: 0,
        sixPiece: 0,
        eightPiece: 0,
        extrasToSave: [],
        notes: ''
      },
      anteMortemTime: '',
      fsisInitial: '',
      finalCount: 0,
      processingStarted: true,
      processingFinished: false
    };

    this.lotsService.createLots([newLot]).subscribe(
      (resp) => {
        this.newLotModal.dismiss();
        // Refresh the lots list
        this.init();
      },
      (error) => {
        this.presentAlert('Error Creating Lot', error.message, 'Try Again');
      }
    );
  }

  disableAddLot() {
    return !this.newLotCustomer || !this.newLotSpecies;
  }

  customerChange(event: {
    component: IonicSelectableComponent,
    value: Customer
  }) {
    this.customer = event.value;
  }

  modalDismissed() {
    this.customer = undefined;
    this.newLotCustomer = undefined;
    this.newLotSpecies = '';
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



  fetchUserRole() {
    const userDetails = this.identityService.getUserDetails();
    const userId = userDetails?.userId;
    
    if (userId) {
      this.usersService.getUserByUserId(userId).subscribe({
        next: (response) => {
          this.userRole = response.data.role || '';
        },
        error: (err) => {
          console.error('Error fetching user role:', err);
        }
      });
    }
  }

  get isAdmin(): boolean {
    return this.userRole === 'admin';
  }

  async confirmDeleteLot(lot: Lot, event: Event) {
    event.stopPropagation();
    
    if (!this.isAdmin) {
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Delete Lot?',
      message: `Are you sure you want to delete lot ${lot.lotNumber}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.deleteLot(lot);
          }
        }
      ]
    });

    await alert.present();
  }

  deleteLot(lot: Lot) {
    this.lotsService.deleteLot(lot.id).subscribe(
      (resp) => {
        if (resp && resp.status === 'success') {
          this.init();
        } else {
          this.loading = false;
          this.presentAlert('Error Deleting Lot', 'Unknown error occurred', 'OK');
        }
      },
      (error) => {
        this.loading = false;
        this.presentAlert('Error Deleting Lot', error.message, 'OK');
      }
    );
  }

  generateSchedule() {
    this.pdfGeneratorService.generateDailySchedule(this.lots);
  }

  generateLotLabels() {
    this.pdfGeneratorService.generateLotLabelsPdf(this.lots);
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
