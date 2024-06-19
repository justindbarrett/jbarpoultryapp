import { 
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
  IonItem } from '@ionic/angular/standalone';
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Customer } from 'src/app/models/customer.model';
import { CustomersService } from 'src/app/customers.service';
import { addIcons } from 'ionicons';
import { add, arrowBack, arrowForward, checkmarkCircle, radioButtonOff } from 'ionicons/icons';
import { AlertController } from '@ionic/angular';
import { CalendarComponent, CalendarMode, NgCalendarModule } from 'ionic7-calendar';
import { IonicSelectableComponent } from 'ionic-selectable';
import { ScheduleService } from 'src/app/schedule.service';
import { ScheduledLot } from 'src/app/models/schedule.model';
import { format } from 'date-fns/format';
import { parseISO } from 'date-fns/parseISO';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.page.html',
  styleUrls: ['./schedule.page.scss'],
  standalone: true,
  imports: [ 
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
export class SchedulePage implements OnInit {

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
    lotId: "",
    id: "",
  };
  public eventSource: ScheduledLot[] = [];
  public calendarViewTitle: string = "";
  public presentingElement: any = null;
  public customers: Customer[] = [];
  public customer: Customer | undefined = undefined;
  public showStart: boolean = false;
  public showEnd: boolean = false;
  public formattedStart: string = "";
  public formattedEnd: string = "";
  public autoSelect: boolean = true;
  public lotDetails: boolean = false;
  private shouldContinue: boolean = false;

  // toast
  public isToastOpen: boolean = false;
  public successToastMessage: string = "";

  constructor(
    private ionRouterOutlet: IonRouterOutlet,
    private customersService: CustomersService,
    private scheduleService: ScheduleService,
    private alertCtrl: AlertController,
  ) {
    addIcons({ add, arrowBack, arrowForward, radioButtonOff, checkmarkCircle });
    this.presentingElement = this.ionRouterOutlet.nativeEl;
  }

  ngOnInit(): void {
    this.init();
  }

  init() {
    this.eventSource = [];
    this.lotDetails = false;
    this.customersService.getCustomers().subscribe(resp => {
      this.customers = resp.customers;
      this.customersService.setCurrentCustomerList(this.customers);
    });
    this.scheduleService.getScheduledLots().subscribe(resp => {
       resp.lots.forEach(lot => {
         this.eventSource.push(this.transformLotEvent(lot));
         this.calendarView.loadEvents();
      });
    });
  }

  calendarBack() {
    this.calendarView.slidePrev();
  }

  calendarForward() {
    this.calendarView.slideNext();
  }

  scheduleEvent() {
    if (this.customer) {
      this.scheduleService.scheduleLot(
        this.customer.id, 
        "",
        this.newEvent.allDay,
        new Date(this.newEvent.endTime),
        new Date(this.newEvent.startTime),
        this.newEvent.title).subscribe(
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
    return !(this.newEvent.title && this.customer);
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

  modalDismissed() {
    this.newEvent.title = "";
    this.customer = undefined;
    this.lotDetails = false;
  }

  onEventSelected(event: any) {
    this.lotDetails = true;
    this.customer = this.customers.find((cust) =>
      cust.id === event.customerId
    );
    this.newEvent = { ...event };
    this.formattedStart = format(event.startTime, 'HH:mm, MMM d, yyyy');
    this.newEvent.startTime = format(event.startTime, "yyyy-MM-dd'T'HH:mm:ss");
    this.formattedEnd = format(event.endTime, 'HH:mm, MMM d, yyyy');
    this.newEvent.endTime = format(event.endTime, "yyyy-MM-dd'T'HH:mm:ss");
    this.newEventModal.present();
  }

  async saveEditEvent() {
    if (this.customer) {
      await this.presentContinueAlert(
        `Continue?`, 
        `This action will update the scheduled event in the system. Are you sure you want to continue?`
      );
      if (this.shouldContinue) {
        this.scheduleService.updateSchedule(
          this.newEvent.id,
          this.customer.id, 
          this.newEvent.lotId,
          this.newEvent.allDay,
          new Date(this.newEvent.endTime),
          new Date(this.newEvent.startTime),
          this.newEvent.title).subscribe(
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
    return !(this.newEvent.title && this.customer);
  }

  transformLotEvent(scheduledLot: ScheduledLot) {
    const event: ScheduledLot = {
      id: scheduledLot.id,
      customerId: scheduledLot.customerId,
      lotId: scheduledLot.lotId,
      title: scheduledLot.title,
      allDay: scheduledLot.allDay,
      startTime: new Date(scheduledLot.startTime),
      endTime: new Date(scheduledLot.endTime)
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
}
