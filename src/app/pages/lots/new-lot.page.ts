import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NavController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common'; // Needed for *ngIf, *ngFor
import { Consts } from 'src/app/consts';

@Component({
  selector: 'app-new-lot',
  templateUrl: './new-lot.page.html',
  styleUrls: ['./new-lot.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    IonicModule
  ],
})
export class NewLotPage implements OnInit {
  lotForm: FormGroup;
  
  // Data for Selectors
  customers = ['Customer A', 'Customer B', 'Customer C'];
  poultryTypes = Consts.SPECIES_TYPES;

  // Current date/time setup
  todayISOString: string = new Date().toISOString().substring(0, 10);
  currentTimeISOString: string = new Date().toISOString(); 
  maxDate: string = this.todayISOString; 

  constructor(
    private fb: FormBuilder,
    private navCtrl: NavController
  ) {
    this.lotForm = this.fb.group({
      // 📝 Section 1: Core Details
      coreDetails: this.fb.group({
        customer: ['', Validators.required],
        processDate: [this.todayISOString, Validators.required], // Defaulted to today
        lotNumber: [{ value: 'TBD by Backend', disabled: true }], // Read-only/Disabled
      }),

      // 📝 Section 2: Lot Intake
      lotIntake: this.fb.group({
        timeIn: [this.currentTimeISOString, Validators.required],
        withdrawalMet: [false, Validators.required], // Default to false
        isOrganic: [false, Validators.required], // Default to false
        poultryType: ['', Validators.required],
        initialCount: [null, [Validators.required, Validators.min(1)]],
        specialInstructions: [''],
      }),

      // 📝 Section 3: Lot Completion
      lotCompletion: this.fb.group({
        timeOut: [this.currentTimeISOString, Validators.required],
        initials: ['', [Validators.required, Validators.maxLength(5)]],
        finalCount: [null, [Validators.required, Validators.min(1)]],
      }),
    });
  }

  ngOnInit() {}

  // Getter for easy access to form controls in the template
  get f() {
    return this.lotForm.controls;
  }

  async onSubmit() {
    if (this.lotForm.invalid) {
      this.lotForm.markAllAsTouched();
      console.log('Form Invalid. Value:', this.lotForm.value);
      return;
    }

    console.log('Lot Data Submitted:', this.lotForm.value);
    
    // 💡 TODO: Add your service logic here to submit lotForm.value
  }
}