import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonItem, IonLabel, IonInput, IonDatetime, IonTextarea, IonButtons, IonText, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol, IonToggle, IonSelect, IonSelectOption, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { LotsService } from 'src/app/lots.service';
import { Lot } from 'src/app/models/lot.model';
import { AlertController, NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { informationCircleOutline } from 'ionicons/icons';
import { Consts } from 'src/app/consts';
import { FsisInitialButtonComponent, FsisInitialConfirmation } from 'src/app/components/fsis-initial-button/fsis-initial-button.component';
import { CustomerInitialButtonComponent, CustomerInitialConfirmation } from 'src/app/components/customer-initial-button/customer-initial-button.component';
import { format, parse } from 'date-fns';
import { AuthenticationService } from 'src/app/authentication.service';
import { IdentityService } from 'src/app/identity.service';
import { UsersService } from 'src/app/users.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lot-detail',
  templateUrl: './lot-detail.page.html',
  styleUrls: ['./lot-detail.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonItem, IonLabel, IonInput, IonDatetime, IonTextarea, IonButtons, IonText, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol, IonToggle, IonSelect, IonSelectOption, IonIcon, IonSpinner, FsisInitialButtonComponent, CustomerInitialButtonComponent],
})
export class LotDetailPage implements OnInit, OnDestroy {
  public lot: any = null;
  public loading: boolean = false;
  poultryTypes: string[] = Consts.SPECIES_TYPES;
  private userStableSubscription: Subscription | null = null;
  public userRole: string = '';

  constructor(
    private lotsService: LotsService,
    private alertCtrl: AlertController,
    public navCtrl: NavController,
    private route: ActivatedRoute,
    private authService: AuthenticationService,
    private identityService: IdentityService,
    private usersService: UsersService
  ) {
    addIcons({ informationCircleOutline });
  }

  get formattedTimeIn(): string {
    if (!this.lot?.timeIn) return '';
    try {
      // Try to parse as ISO date first (new format from customer initial)
      const date = new Date(this.lot.timeIn);
      if (!isNaN(date.getTime())) {
        return format(date, 'h:mm a');
      }
      // Fallback to HH:mm:ss format parsing
      const parsedDate = parse(this.lot.timeIn, 'HH:mm:ss', new Date());
      return format(parsedDate, 'h:mm a');
    } catch (e) {
      return this.lot.timeIn;
    }
  }

  get isAdmin(): boolean {
    return this.userRole === 'admin';
  }

  get isInspector(): boolean {
    return this.userRole === 'inspector';
  }

  canEditCheckInDetails(): boolean {
    // Inspector can never edit
    if (this.isInspector) {
      return false;
    }
    // Admin can always edit
    if (this.isAdmin) {
      return true;
    }
    // Service can only edit before customer initial is set
    return !this.lot?.customerInitial;
  }

  canEditProcessingInstructions(): boolean {
    // Inspector can never edit
    if (this.isInspector) {
      return false;
    }
    // Admin can always edit
    if (this.isAdmin) {
      return true;
    }
    // Service can only edit before customer initial is set
    return !this.lot?.customerInitial;
  }

  async ngOnInit(): Promise<void> {
    console.log('LotDetailPage ngOnInit called');
    console.log('Current URL:', this.route.snapshot.url);
    
    this.loading = true;
    let isStable = false;
    
    await this.authService.getUserIdToken().then(
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
      this.initializeLot();
    }
    else {
      console.log('Auth not stable yet, waiting for user details...');
      this.userStableSubscription = this.identityService.getUserDetailsObservable().subscribe(
        (userDetails) => {
          console.log('User details received, initializing lot');
          this.initializeLot();
        },
        (error) => {
          this.loading = false;
          this.presentAlert("Error Getting Logged In User", error.message);
          setTimeout(() => {
            this.navCtrl.navigateRoot('/login');
          }, 2000);
        }
      );
    }
  }
  
  async initializeLot(): Promise<void> {
    console.log('Initializing lot...');
    
    // Fetch user role
    await this.fetchUserRole();
    
    // Read navigation state first
    const state = (history && (history.state as any)) || {};
    if (state && state.lot) {
      this.lot = state.lot;
      this.loading = false;
      console.log('Lot loaded from state:', this.lot);
      console.log('Lot species:', this.lot.species);
      // Initialize processingInstructions if not present
      if (!this.lot.processingInstructions) {
        this.lot.processingInstructions = {
          wholeBirds: 0,
          cutUpBirds: 0,
          halves: 0,
          sixPiece: 0,
          eightPiece: 0,
          extrasToSave: [],
          notes: ''
        };
      }
    } else {
      // If no state, try to get lot ID from route and fetch from backend
      const lotId = this.route.snapshot.paramMap.get('id');
      console.log('No state found, extracting ID from route:', lotId);
      
      if (lotId) {
        console.log('Fetching lot from backend with ID:', lotId);
        console.log('API call: GET lot/' + lotId);
        
        this.lotsService.getLot(lotId).subscribe(
          (lot) => {
            this.loading = false;
            this.lot = lot;
            console.log('Lot loaded from backend successfully:', JSON.stringify(lot, null, 2));
            // Initialize processingInstructions if not present
            if (!this.lot.processingInstructions) {
              this.lot.processingInstructions = {
                wholeBirds: 0,
                cutUpBirds: 0,
                halves: 0,
                sixPiece: 0,
                eightPiece: 0,
                extrasToSave: [],
                notes: ''
              };
            }
          },
          (error) => {
            this.loading = false;
            console.error('Error fetching lot:', error);
            console.error('Error status:', error.status);
            console.error('Error message:', error.message);
            console.error('Full error:', JSON.stringify(error, null, 2));
            this.presentAlert('Lot Not Found', `Unable to load lot data. Error: ${error.status} - ${error.statusText || error.message}`);
            setTimeout(() => {
              this.navCtrl.navigateRoot('/landing/lots');
            }, 2000);
          }
        );
      } else {
        this.loading = false;
        console.error('No lot ID found in route');
        this.presentAlert('Lot Not Found', 'No lot ID was provided.');
        setTimeout(() => {
          this.navCtrl.navigateRoot('/landing/lots');
        }, 2000);
      }
    }
  }
  
  ngOnDestroy(): void {
    if (this.userStableSubscription) {
      this.userStableSubscription.unsubscribe();
    }
  }

  cancel() {
    this.navCtrl.navigateRoot('/landing/lots');
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  async showWithdrawalInfo() {
    await this.presentAlert('Withdrawal Time', 'Withdrawal time has been met for medications and antibiotics');
  }

  async showOrganicInfo() {
    await this.presentAlert('Organic Certification', 'This is a lot of certified organic poultry that has been transported according to organic standards');
  }

  async fetchUserRole(): Promise<void> {
    const userDetails = this.identityService.getUserDetails();
    const userId = userDetails?.userId;
    
    if (!userId) return;
    
    try {
      const response = await this.usersService.getUserByUserId(userId).toPromise();
      this.userRole = response?.data?.role || '';
    } catch (err) {
      console.error('Error fetching user role:', err);
      this.userRole = '';
    }
  }

  onCustomerInitialConfirmed(confirmation: CustomerInitialConfirmation) {
    this.lot.customerInitial = confirmation.initials;
    this.lot.timeIn = confirmation.timestamp;
    this.lot.checkInDetailsEditable = false;
    if (this.lot.processingInstructions) {
      this.lot.processingInstructions.isEditable = false;
    }
    // Save the lot after setting customer initials
    this.save(true);
  }

  onFsisConfirmed(confirmation: FsisInitialConfirmation) {
    this.lot.anteMortemTime = confirmation.timestamp;
    this.lot.fsisInitial = confirmation.initials;
    this.save(true);
  }

  save(silent: boolean = false) {
    console.log('Saving lot:', this.lot);
    console.log('Lot ID:', this.lot?.id);
    
    if (!this.lot || !this.lot.id) {
      this.presentAlert('Invalid Lot', 'Cannot save an invalid lot');
      return;
    }

    // Call update on LotsService - use the existing signature
    this.lotsService.updateLot(
      this.lot.id,
      this.lot.processDate,
      this.lot.customer?.id || '',
      this.lot.timeIn || '',
      !!this.lot.withdrawalMet,
      !!this.lot.isOrganic,
      this.lot.lotNumber || '',
      this.lot.species || '',
      this.lot.customerCount || 0,
      this.lot.processingInstructions || {
        wholeBirds: 0,
        cutUpBirds: 0,
        halves: 0,
        sixPiece: 0,
        eightPiece: 0,
        extrasToSave: [],
        notes: ''
      },
      this.lot.anteMortemTime || '',
      this.lot.customerInitial || '',
      this.lot.fsisInitial || '',
      this.lot.finalCount || 0
    ).subscribe(
      (resp) => {
        if (!silent) {
          this.presentAlert('Saved', 'Lot saved successfully.');
          this.navCtrl.navigateRoot('/landing/lots');
        }
      },
      (err) => {
        console.error('Save failed', err);
        this.presentAlert('Error', 'Failed to save lot.');
      }
    );
  }
}
