import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButtons, IonRouterOutlet, IonSegment, IonSegmentButton, IonFab, IonFabButton, IonSearchbar, IonModal, IonInput, IonIcon, IonList, IonLabel, IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonRow, IonCard, IonItem } from '@ionic/angular/standalone';
import { Customer } from 'src/app/models/customer.model';
import { CustomersService } from 'src/app/customers.service';
import { addIcons } from 'ionicons';
import { add, arrowBack, arrowForward, checkmarkCircle, radioButtonOff } from 'ionicons/icons';
import { AlertController } from '@ionic/angular';
import { CalendarComponent, CalendarMode, NgCalendarModule } from 'ionic7-calendar';

import { IonicSelectableComponent } from 'ionic-selectable';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.page.html',
  styleUrls: ['./schedule.page.scss'],
  standalone: true,
  imports: [ IonicSelectableComponent, IonButtons, IonRouterOutlet, NgCalendarModule, IonSegment, IonSegmentButton, IonFab, IonFabButton, IonSearchbar, IonModal, IonInput, IonIcon, IonList, IonLabel, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonRow, IonCard, IonItem ],
  providers: [ CustomersService ]
})
export class SchedulePage implements OnInit {

  @ViewChild(CalendarComponent) calendarView: CalendarComponent;
  public calendar = {
    mode: 'month' as CalendarMode,
    currentDate: new Date()
  };
  public newEvent: any = {
    title: "",
    allDay: false,
    startTime: null
  };
  public calendarViewTitle: string = "";
  public presentingElement: any = null;
  public customers: Customer[] = [];
  public customer: Customer;

  constructor(private ionRouterOutlet: IonRouterOutlet,
    private customersService: CustomersService
  ) {
    addIcons({ add, arrowBack, arrowForward, radioButtonOff, checkmarkCircle });
    this.presentingElement = this.ionRouterOutlet.nativeEl;
  }

  ngOnInit(): void {
    this.customersService.getCustomers().subscribe(resp => {
      this.customers = resp.customers;
      this.customersService.setCurrentCustomerList(this.customers);
    });
  }

  calendarBack() {
    this.calendarView.slidePrev();
  }

  calendarForward() {
    this.calendarView.slideNext();
  }

  scheduleEvent() {

  }

  customerChange(event: {
    component: IonicSelectableComponent,
    value: Customer
  }) {
    console.log('customer:', event.value);
    this.customer = event.value;
  }
}
