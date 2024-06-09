import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonInput, IonCardHeader, IonCardContent, IonCol, IonRow, IonCard, IonTitle, IonMenuButton, IonToolbar, IonButtons, IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonListHeader, IonNote, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterOutlet, IonHeader, IonButton } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { calendarOutline, calendarSharp, cubeOutline, cubeSharp, peopleOutline, peopleSharp, settingsOutline, settingsSharp } from 'ionicons/icons';

import { AccountSettingsPage } from '../pages/accountsettings/accountsettings.page';
import { AppPages } from '../pages.service';
import { CustomersPage } from '../pages/customers/customers.page';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
  standalone: true,
  imports: [AccountSettingsPage, CustomersPage, CommonModule, RouterLink, RouterLinkActive, IonInput, IonCardHeader, IonCardContent, IonCol, IonRow, IonCard, IonHeader, IonMenuButton, IonToolbar, IonButtons, IonTitle, IonButton, IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonListHeader, IonNote, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterOutlet]
})
export class FolderPage implements OnInit {
  public pageTitle!: string;
  private activatedRoute = inject(ActivatedRoute);

  constructor(
    private router: Router,
    private appPages: AppPages
  ) {
    addIcons({ peopleOutline, peopleSharp, calendarOutline, calendarSharp, cubeOutline, cubeSharp, settingsOutline, settingsSharp });
  }

  ngOnInit() {
    const pageUrl = this.router.url;
    const page = this.appPages.getPage(pageUrl);
    this.pageTitle =  page ? page.title : "";
  }

  showSettingsPage() {
    return this.router.url == "/landing/accountsettings";
  }

  showCustomersPage() {
    return this.router.url == "/landing/customers";
  }
}
