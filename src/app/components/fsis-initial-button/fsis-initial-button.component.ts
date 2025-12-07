import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonCard, IonCardContent, IonCardHeader, IonSpinner, IonText } from '@ionic/angular/standalone';
import { IdentityService } from 'src/app/identity.service';
import { UsersService } from 'src/app/users.service';
import { format } from 'date-fns';

export interface FsisInitialConfirmation {
  initials: string;
  timestamp: string;
  formattedTime: string;
}

@Component({
  selector: 'app-fsis-initial-button',
  templateUrl: './fsis-initial-button.component.html',
  styleUrls: ['./fsis-initial-button.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
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
    IonText
  ]
})
export class FsisInitialButtonComponent {
  @Input() buttonText: string = 'FSIS Initial';
  @Input() buttonColor: string = 'secondary';
  @Input() buttonExpand: 'block' | 'full' | undefined = 'block';
  @Input() disabled: boolean = false;
  @Input() fsisInitial: string = '';
  @Input() anteMortemTime: string = '';
  @Output() confirmed = new EventEmitter<FsisInitialConfirmation>();

  public isModalOpen: boolean = false;
  public activeInitials: string = '';
  public currentTimestamp: string = '';
  public formattedTime: string = '';
  public loading: boolean = false;
  public userRole: string = '';

  constructor(
    private identityService: IdentityService,
    private usersService: UsersService
  ) {
    // Fetch user role from database
    const userDetails = this.identityService.getUserDetails();
    const userId = userDetails?.userId;
    
    if (userId) {
      this.usersService.getUserByUserId(userId).subscribe({
        next: (response) => {
          this.userRole = response.data.role || '';
        },
        error: (err) => {
          console.error('Error fetching user role:', err);
          this.userRole = '';
        }
      });
    }
  }

  get isInspector(): boolean {
    return this.userRole === 'inspector';
  }

  get hasInitials(): boolean {
    return !!this.fsisInitial;
  }

  get displayTime(): string {
    if (!this.anteMortemTime) return '';
    // If the time looks like it has a date, try to parse and format it
    // Otherwise just return it as-is
    try {
      const date = new Date(this.anteMortemTime);
      if (!isNaN(date.getTime())) {
        return format(date, 'hh:mm a');
      }
    } catch (e) {
      // If parsing fails, return original
    }
    return this.anteMortemTime;
  }

  openModal() {
    if (this.disabled || !this.isInspector) {
      return;
    }

    this.loading = true;
    this.isModalOpen = true;

    // Get user ID from identity service
    const userDetails = this.identityService.getUserDetails();
    const userId = userDetails?.userId;

    if (!userId) {
      this.activeInitials = 'N/A';
      this.loading = false;
      this.setTimestamp();
      return;
    }

    // Fetch user data to get active initials
    this.usersService.getUserByUserId(userId).subscribe({
      next: (response) => {
        const initials = response.data.initials || [];
        this.activeInitials = initials[0] || 'N/A';
        this.setTimestamp();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching user initials:', err);
        this.activeInitials = 'N/A';
        this.setTimestamp();
        this.loading = false;
      }
    });
  }

  private setTimestamp() {
    const now = new Date();
    this.currentTimestamp = now.toISOString();
    // Format time for Denver timezone (hh:mm a format only)
    this.formattedTime = format(now, 'hh:mm a');
  }

  cancel() {
    this.isModalOpen = false;
    this.loading = false;
  }

  confirm() {
    if (this.loading) {
      return;
    }
    
    const confirmation: FsisInitialConfirmation = {
      initials: this.activeInitials,
      timestamp: this.currentTimestamp,
      formattedTime: this.formattedTime
    };
    
    this.isModalOpen = false;
    
    // Emit after a short delay to ensure modal closes first
    setTimeout(() => {
      this.confirmed.emit(confirmation);
    }, 100);
  }
}
