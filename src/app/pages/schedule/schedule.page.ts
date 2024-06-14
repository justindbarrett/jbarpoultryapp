import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonToggle, IonText, IonDatetime, IonButtons, IonRouterOutlet, IonSegment, IonSegmentButton, IonFab, IonFabButton, IonSearchbar, IonModal, IonInput, IonIcon, IonList, IonLabel, IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonRow, IonCard, IonItem } from '@ionic/angular/standalone';
import { Customer } from 'src/app/models/customer.model';
import { CustomersService } from 'src/app/customers.service';
import { addIcons } from 'ionicons';
import { add, arrowBack, arrowForward, checkmarkCircle, radioButtonOff } from 'ionicons/icons';
import { AlertController } from '@ionic/angular';
import { CalendarComponent, CalendarMode, NgCalendarModule } from 'ionic7-calendar';

import { IonicSelectableComponent } from 'ionic-selectable';
import { ScheduleService } from 'src/app/schedule.service';
import { ScheduledLot } from 'src/app/models/schedule.model';
import { IEvent } from 'ionic7-calendar/calendar.interface';
import { format } from 'date-fns/format';
import { parseISO } from 'date-fns/parseISO';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.page.html',
  styleUrls: ['./schedule.page.scss'],
  standalone: true,
  imports: [ IonToggle, IonText, IonDatetime, IonicSelectableComponent, IonButtons, IonRouterOutlet, NgCalendarModule, IonSegment, IonSegmentButton, IonFab, IonFabButton, IonSearchbar, IonModal, IonInput, IonIcon, IonList, IonLabel, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonRow, IonCard, IonItem ],
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
    endTime: null
  };
  public eventSource: IEvent[] = [];
  public calendarViewTitle: string = "";
  public presentingElement: any = null;
  public customers: Customer[] = [];
  public customer: Customer | null = null;
  public showStart: boolean = false;
  public showEnd: boolean = false;
  public formattedStart: string = "";
  public formattedEnd: string = "";
  public autoSelect: boolean = true;

  constructor(private ionRouterOutlet: IonRouterOutlet,
    private customersService: CustomersService,
    private scheduleService: ScheduleService,
  ) {
    addIcons({ add, arrowBack, arrowForward, radioButtonOff, checkmarkCircle });
    this.presentingElement = this.ionRouterOutlet.nativeEl;
  }

  ngOnInit(): void {
    this.customersService.getCustomers().subscribe(resp => {
      this.customers = resp.customers;
      this.customersService.setCurrentCustomerList(this.customers);
    });
    this.scheduleService.getScheduledLots().subscribe(resp => {
      resp.lots.forEach(lot => {
        const event: IEvent = {
          title: lot.eventData.title,
          allDay: lot.eventData.allDay,
          startTime: new Date(lot.eventData.startTime),
          endTime: new Date(lot.eventData.endTime)
        }
        this.eventSource.push(event);
      });
    });
    console.log(this.newEvent.allDay)
  }

  calendarBack() {
    this.calendarView.slidePrev();
  }

  calendarForward() {
    this.calendarView.slideNext();
  }

  scheduleEvent() {
    if (this.customer) {
      const eventToAdd: IEvent = {
        title: this.newEvent.title,
        allDay: this.newEvent.allDay,
        startTime: new Date(this.newEvent.startTime),
        endTime: new Date(this.newEvent.endTime)
      }
      this.scheduleService.scheduleLot(this.customer.id, "", eventToAdd).subscribe(
        (resp) => {
          if (resp) {
            this.newEventModal.dismiss();
            this.eventSource.push(eventToAdd);
            this.calendarView.loadEvents();
            // show toast
          }
        }
      );
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

  modalDismissed(event: Event) {
    this.newEvent.title = "";
    this.customer = null;
  }
}
