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
  NavController,
  ViewWillEnter } from '@ionic/angular/standalone';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { Customer } from 'src/app/models/customer.model';
import { CustomersService } from 'src/app/customers.service';
import { addIcons } from 'ionicons';
import { add, arrowBack, arrowForward, checkmarkCircle, radioButtonOff } from 'ionicons/icons';
import { AlertController } from '@ionic/angular';
import { CalendarComponent, CalendarMode, NgCalendarModule } from 'ionic7-calendar';
import { IonicSelectableComponent } from 'ionic-selectable';
import { ScheduleService } from 'src/app/schedule.service';
import { ScheduledLot } from 'src/app/models/schedule.model';
import { Lot } from 'src/app/models/lot.model';
import { format } from 'date-fns/format';
import { parseISO } from 'date-fns/parseISO';
import { Subscription, catchError } from 'rxjs';
import { IdentityService } from 'src/app/identity.service';
import { AuthenticationService } from 'src/app/authentication.service';
import { LotsService } from 'src/app/lots.service';
import { Consts } from 'src/app/consts';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.page.html',
  styleUrls: ['./schedule.page.scss'],
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
    IonItem ],
  providers: [ CustomersService ]
})
export class SchedulePage implements OnInit, OnDestroy, ViewWillEnter {

  @ViewChild(CalendarComponent) calendarView: CalendarComponent;
  @ViewChild('modal') newEventModal: IonModal;
  public calendar = {
    mode: 'month' as CalendarMode,
    currentDate: new Date()
  };
  public newEvent: any = {
    title: "",
    allDay: false,
    startTime: null,
    endTime: null,
    customerId: "",
    id: "",
    species: "",
    count: 0,
  };
  public eventSource: ScheduledLot[] = [];
  public calendarViewTitle: string = "";
  public presentingElement: any = null;
  public customers: Customer[] = [];
  public customer: Customer | undefined = undefined;
  public speciesTypes: string[] = Consts.SPECIES_TYPES;
  public showStart: boolean = false;
  public showEnd: boolean = false;
  public formattedStart: string = "";
  public formattedEnd: string = "";
  public autoSelect: boolean = true;
  public lotDetails: boolean = false;
  private shouldContinue: boolean = false;
  public loading: boolean = true;
  private userStableSubscription: Subscription;
  private hasEnteredView: boolean = false;
  private routerSubscription: Subscription;

  public calendarOptions = {
    weekDayNames: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  };

  // toast
  public isToastOpen: boolean = false;
  public successToastMessage: string = "";

  constructor(
    private ionRouterOutlet: IonRouterOutlet,
    private navCtrl: NavController,
    private router: Router,
    private customersService: CustomersService,
    private scheduleService: ScheduleService,
    private lotsService: LotsService,
    private alertCtrl: AlertController,
    private identityService: IdentityService,
    private authenticationService: AuthenticationService
  ) {
    addIcons({ add, arrowBack, arrowForward, radioButtonOff, checkmarkCircle });
    this.presentingElement = this.ionRouterOutlet.nativeEl;
  }

  async ngOnInit() {
    this.loading = true;
    
    // Watch for navigation to schedule page
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd && event.url === '/landing/schedule') {
        if (this.hasEnteredView) {
          this.init();
        }
        this.hasEnteredView = true;
      }
    });
    
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
    if (this.routerSubscription)
      this.routerSubscription.unsubscribe();
  }

  ionViewWillEnter() {
    // Refresh data each time the page is entered after the first time
    if (this.hasEnteredView) {
      this.init();
    }
    this.hasEnteredView = true;
  }

  init() {
    this.loading = true;
    this.eventSource = [];
    this.lotDetails = false;
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
    this.scheduleService.getScheduledLots().subscribe(
      (resp) => {
        resp.lots.forEach(lot => {
          this.eventSource.push(this.transformLotEvent(lot));
          this.calendarView.loadEvents();
        });
        this.loading = false;
      },
      (error) => {
        this.presentAlert("Error Retrieving Schedule Events", error.message, "Try Again");
        this.loading = false;
      }
    );
  }

  calendarBack() {
    this.calendarView.slidePrev();
  }

  calendarForward() {
    this.calendarView.slideNext();
  }

  scheduleEvent() {
    if (this.customer) {
      // Auto-generate title from species and count
      const title = `${this.newEvent.species} - ${this.newEvent.count}`;
      
      this.scheduleService.scheduleLot(
        this.customer.id,
        this.newEvent.allDay,
        new Date(this.newEvent.endTime),
        new Date(this.newEvent.startTime),
        title,
        this.newEvent.species,
        this.newEvent.count).subscribe(
        (resp) => {
          if (resp && resp.status == "success") {
            this.init();
            this.newEventModal.dismiss();
            this.openSuccessToast(true, "Lot Event Added Successfully!");
          }
          else {
            this.presentAlert("Failed Add Event Attempt", "Unknown Error Occurred", "Try Again");
          }
        },
        (error) => {
          this.presentAlert("Failed Add Event Attempt", error, "Try Again");
        }
      );
    }
    else {
      this.presentAlert("Failed Add Event Attempt", "Customer on event is not defined", "Try Again");
      this.newEventModal.dismiss();
    }
  }

  disableScheduleEvent() {
    return !(this.newEvent.species && this.newEvent.count >= 0 && this.customer);
  }

  customerChange(event: {
    component: IonicSelectableComponent,
    value: Customer
  }) {
    this.customer = event.value;
  }

  onCurrentDateChanged(event: Date) {
    this.calendar.currentDate = event;
  }

  onTimeSelected(event: {
    selectedTime: Date,
    events: any[]
  }) {
    this.formattedStart = format(event.selectedTime, 'HH:mm, MMM d, yyyy');
    this.newEvent.startTime = format(event.selectedTime, "yyyy-MM-dd'T'HH:mm:ss");
    const later = event.selectedTime.setHours(event.selectedTime.getHours() + 1);
    this.formattedEnd = format(later, 'HH:mm, MMM d, yyyy');
    this.newEvent.endTime = format(later, "yyyy-MM-dd'T'HH:mm:ss");

    if (this.calendar.mode === 'day' || this.calendar.mode === 'week') {
      this.newEventModal.present();
    }
  }

  startChanged(value: any) {
    this.newEvent.startTime = value;
    this.formattedStart = format(parseISO(value), 'HH:mm, MMM d, yyyy');
  }

  endChanged(value: any) {
    this.newEvent.endTime = value;
    this.formattedEnd = format(parseISO(value), 'HH:mm, MMM d, yyyy');
  }

  segmentChanged(event: any) {
    const mode = event.detail.value;
    if (mode === 'week' || mode === 'day') {
      this.autoSelect = false;
    }
    else {
      this.autoSelect = true;
    }
  }

  getSelectedDateTotals(): { total: number, bySpecies: { [key: string]: number } } {
    const selectedDate = new Date(this.calendar.currentDate);
    selectedDate.setHours(0, 0, 0, 0);
    
    const selectedDateEvents = this.eventSource.filter((event) => {
      const eventDate = new Date(event.startTime);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === selectedDate.getTime();
    });

    const totals = {
      total: 0,
      bySpecies: {} as { [key: string]: number }
    };

    selectedDateEvents.forEach(event => {
      const count = event.count || 0;
      totals.total += count;
      
      if (event.species) {
        if (!totals.bySpecies[event.species]) {
          totals.bySpecies[event.species] = 0;
        }
        totals.bySpecies[event.species] += count;
      }
    });

    return totals;
  }

  getSpeciesList(): string[] {
    const totals = this.getSelectedDateTotals();
    return Object.keys(totals.bySpecies);
  }

  modalDismissed() {
    this.newEvent.title = "";
    this.newEvent.species = "";
    this.newEvent.count = 0;
    this.customer = undefined;
    this.lotDetails = false;
  }

  onEventSelected(event: any) {
    console.log('Event selected:', event);
    this.lotDetails = true;
    this.customer = this.customers.find((cust) =>
      cust.id === event.customerId
    );
    this.newEvent = { ...event };
    console.log('newEvent after spread:', this.newEvent);
    this.formattedStart = format(event.startTime, 'HH:mm, MMM d, yyyy');
    this.newEvent.startTime = format(event.startTime, "yyyy-MM-dd'T'HH:mm:ss");
    this.formattedEnd = format(event.endTime, 'HH:mm, MMM d, yyyy');
    this.newEvent.endTime = format(event.endTime, "yyyy-MM-dd'T'HH:mm:ss");
    console.log('newEvent before modal present:', this.newEvent);
    this.newEventModal.present();
  }

  async saveEditEvent() {
    if (this.customer) {
      await this.presentContinueAlert(
        `Continue?`, 
        `This action will update the scheduled event in the system. Are you sure you want to continue?`
      );
      if (this.shouldContinue) {
        // Auto-generate title from species and count
        const title = `${this.newEvent.species} - ${this.newEvent.count}`;
        
        this.scheduleService.updateSchedule(
          this.newEvent.id,
          this.customer.id,
          this.newEvent.allDay,
          new Date(this.newEvent.endTime),
          new Date(this.newEvent.startTime),
          title,
          this.newEvent.species,
          this.newEvent.count,
          undefined).subscribe(
          (resp) => {
            if (resp && resp.status == "success") {
              this.init();
              this.newEventModal.dismiss();
              this.openSuccessToast(true, "Lot Event Updated Successfully!");
            }   
            else {
              this.presentAlert("Failed Event Update Attempt", "Unknown Error Occurred", "Try Again");
            }
          },
          (error) => {
            this.presentAlert("Failed Update Event Attempt", error, "Try Again");
          }
        );
      }
    }
    else {
      this.presentAlert("Failed Update Event Attempt", "Customer on event is not defined", "Try Again");
      this.newEventModal.dismiss();
    }
  }

  disableSaveEditEvent() {
    return !(this.newEvent.species && this.newEvent.count >= 0 && this.customer);
  }

  transformLotEvent(scheduledLot: ScheduledLot) {
    const event: ScheduledLot = {
      id: scheduledLot.id,
      customerId: scheduledLot.customerId,
      title: scheduledLot.title,
      allDay: scheduledLot.allDay,
      startTime: new Date(scheduledLot.startTime),
      endTime: new Date(scheduledLot.endTime),
      processingStarted: scheduledLot.processingStarted || false,
      species: scheduledLot.species,
      count: scheduledLot.count || 0
    }
    return event;
  }

  async deleteEvent() {
    await this.presentContinueAlert(
      `Continue?`, 
      `This action will delete the scheduled event in the system. Are you sure you want to continue?`
    );
    if (this.shouldContinue) {
      this.scheduleService.deleteCustomer(
        this.newEvent.id).subscribe(
        (resp) => {
          if (resp && resp.status == "success") {
            this.init();
            this.newEventModal.dismiss();
            this.openSuccessToast(true, "Lot Event Deleted Successfully!");
          }
          else {
            this.presentAlert("Failed Event Delete Attempt", "Unknown Error Occurred", "Try Again");
          }
        },
        (error) => {
          this.presentAlert("Failed Event Delete Attempt", error, "Try Again");
        }
      );
    }
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

  async processTodaysLots() {
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const processDateStr = format(today, 'yyyy-MM-dd');
    
    // Filter events for today
    const todaysEvents = this.eventSource.filter((event) => {
      const eventDate = new Date(event.startTime);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === today.getTime();
    });

    if (todaysEvents.length === 0) {
      this.presentAlert("No Lots to Process", "There are no lots scheduled for today.", "OK");
      return;
    }
    
    // Filter out events that have already been processed
    const eventsToProcess = todaysEvents.filter(event => !event.processingStarted);
    
    if (eventsToProcess.length === 0) {
      this.presentAlert("No New Lots to Process", "All scheduled lots for today have already been processed.", "OK");
      return;
    }
    
    // Present confirmation alert
    await this.presentContinueAlert(
      "Process Today's Lots?",
      `This action will process ${eventsToProcess.length} lot(s) for today. Are you sure you want to continue?`
    );

    
    if (this.shouldContinue) {
      // Convert ScheduledLot to Lot - backend will auto-generate lot numbers
      const lotsToProcess: Lot[] = eventsToProcess.map((scheduledLot) => {
        const customer = this.customers.find((cust) => cust.id === scheduledLot.customerId);
        
        return {
          id: "",
          processDate: processDateStr,
          customer: customer || {} as Customer,
          timeIn: "",
          withdrawalMet: false,
          isOrganic: false,
          lotNumber: "", // Backend will generate this
          species: scheduledLot.species || "",
          customerCount: scheduledLot.count || 0,
          processingInstructions: {
            wholeBirds: 0,
            cutUpBirds: 0,
            halves: 0,
            sixPiece: 0,
            eightPiece: 0,
            notes: ""
          },
          anteMortemTime: "",
          customerInitial: "",
          fsisInitial: "",
          finalCount: 0,
          processingStarted: true,
          processingFinished: false,
          scheduleLotId: scheduledLot.id
        };
      });
      
      // Call backend to save/process the lots
      this.lotsService.createLots(lotsToProcess).subscribe(
        (resp) => {
          console.log('Create lots response:', resp);
          if (resp && resp.status == "success") {
            console.log('Created lots with IDs:', resp.data);
            // Mark events as processing started
            eventsToProcess.forEach(event => {
              event.processingStarted = true;
              // Update event in backend
              this.scheduleService.updateSchedule(
                event.id,
                event.customerId,
                event.allDay,
                event.endTime,
                event.startTime,
                event.title,
                event.species || "",
                event.count || 0,
                true
              ).subscribe();
            });
            
            this.openSuccessToast(true, "Lots processed successfully!");
            setTimeout(() => {
              this.navCtrl.navigateForward('landing/lots');
            }, 1000);
          }
          else {
            this.presentAlert("Failed Process Lots Attempt", "Unknown Error Occurred", "Try Again");
          }
        },
        (error) => {
          this.presentAlert("Failed Process Lots Attempt", error, "Try Again");
        }
      );
    }
  }
}
