import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonCard, IonCardContent, IonCardHeader, IonSpinner, IonText, IonInput, IonItem, IonLabel } from '@ionic/angular/standalone';
import { format } from 'date-fns';

export interface CustomerInitialConfirmation {
  initials: string;
  timestamp: string;
  formattedTime: string;
}

@Component({
  selector: 'app-customer-initial-button',
  templateUrl: './customer-initial-button.component.html',
  styleUrls: ['./customer-initial-button.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonButton,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonSpinner,
    IonText,
    IonInput,
    IonItem,
    IonLabel
  ]
})
export class CustomerInitialButtonComponent {
  @Input() buttonText: string = 'Customer Initial';
  @Input() buttonColor: string = 'tertiary';
  @Input() buttonExpand: 'block' | 'full' | undefined = 'block';
  @Input() disabled: boolean = false;
  @Input() customerInitial: string = '';
  @Input() timeIn: string = '';
  @Output() confirmed = new EventEmitter<CustomerInitialConfirmation>();

  public isModalOpen: boolean = false;
  public enteredInitials: string = '';

  get hasInitials(): boolean {
    return !!this.customerInitial;
  }

  get displayTime(): string {
    if (!this.timeIn) return '';
    // If the time looks like it has a date, try to parse and format it
    // Otherwise just return it as-is
    try {
      const date = new Date(this.timeIn);
      if (!isNaN(date.getTime())) {
        return format(date, 'hh:mm a');
      }
    } catch (e) {
      // If parsing fails, return original
    }
    return this.timeIn;
  }

  openModal() {
    if (this.disabled) {
      return;
    }

    this.enteredInitials = '';
    this.isModalOpen = true;
  }

  cancel() {
    this.isModalOpen = false;
    this.enteredInitials = '';
  }

  confirm() {
    if (!this.enteredInitials || this.enteredInitials.trim().length === 0) {
      return;
    }
    
    const now = new Date();
    const timestamp = now.toISOString();
    const formattedTime = format(now, 'hh:mm a');
    
    const confirmation: CustomerInitialConfirmation = {
      initials: this.enteredInitials.trim().toUpperCase(),
      timestamp: timestamp,
      formattedTime: formattedTime
    };
    
    this.isModalOpen = false;
    
    // Emit after a short delay to ensure modal closes first
    setTimeout(() => {
      this.confirmed.emit(confirmation);
    }, 100);
  }
}
