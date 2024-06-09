import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonFab, IonFabButton, IonSearchbar, IonModal, IonInput, IonIcon, IonList, IonLabel, IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonRow, IonCard, IonItem } from '@ionic/angular/standalone';
import { Customer } from 'src/app/models/customer.model';
import { CustomersService } from 'src/app/customers.service';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';

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
  public newCustomerName: string = "";
  public newCustomerAddress: string = "";
  public newCustomerPhone: string = "";
  public showAddCustomer: boolean = false;

  constructor(
    private customersService: CustomersService
  ) {
    addIcons({ add });
  }

  ngOnInit() {
    this.customersService.getCustomers().subscribe(resp => {
      this.customers = resp.customers;
    });
  }

  ngOnDestroy(): void {
  }

  setFilteredItems() {
  }

  newCustomer() {
  }

  addCustomer() {
    this.showAddCustomer = true;
  }

  cancelAddCustomer() {
    this.showAddCustomer = false;
  }
}
