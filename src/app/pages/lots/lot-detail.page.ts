import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonItem, IonLabel, IonInput, IonDatetime, IonTextarea, IonButtons, IonText, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol, IonToggle, IonSelect, IonSelectOption, IonIcon } from '@ionic/angular/standalone';
import { LotsService } from 'src/app/lots.service';
import { Lot } from 'src/app/models/lot.model';
import { AlertController, NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { informationCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-lot-detail',
  templateUrl: './lot-detail.page.html',
  styleUrls: ['./lot-detail.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonItem, IonLabel, IonInput, IonDatetime, IonTextarea, IonButtons, IonText, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol, IonToggle, IonSelect, IonSelectOption, IonIcon],
})
export class LotDetailPage implements OnInit {
  public lot: any = null;
  poultryTypes: string[] = ['Broiler', 'Layer', 'Turkey', 'Duck', 'Quail', 'Other'];

  constructor(
    private lotsService: LotsService,
    private alertCtrl: AlertController,
    public navCtrl: NavController
  ) {
    addIcons({ informationCircleOutline });
  }

  ngOnInit(): void {
    // Read navigation state first
    const state = (history && (history.state as any)) || {};
    if (state && state.lot) {
      this.lot = state.lot;
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
      // If no state, inform the user and navigate back
      this.presentAlert('Lot Not Found', 'No lot data was provided.');
      this.navCtrl.back();
    }
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

  save() {
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
      this.lot.specialInstructions || '',
      this.lot.anteMortemTime || '',
      this.lot.fsisInitial || '',
      this.lot.finalCount || 0
    ).subscribe(
      (resp) => {
        this.presentAlert('Saved', 'Lot saved successfully.');
        this.navCtrl.back();
      },
      (err) => {
        console.error('Save failed', err);
        this.presentAlert('Error', 'Failed to save lot.');
      }
    );
  }
}
