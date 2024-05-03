import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonInput, IonCardHeader, IonCardContent, IonCol, IonRow, IonCard, IonTitle, IonMenuButton, IonToolbar, IonButtons, IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonListHeader, IonNote, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterOutlet, IonHeader, IonButton } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { calendarOutline, calendarSharp, cubeOutline, cubeSharp, peopleOutline, peopleSharp, settingsOutline, settingsSharp } from 'ionicons/icons';
import { NavController, AlertController } from '@ionic/angular';
import { IdentityService } from '../identity.service';
import { AuthenticationService } from '../authentication.service';
import { Subscription } from 'rxjs';
import { AccountSettingsPage } from '../pages/accountsettings/accountsettings.page';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
  standalone: true,
  imports: [AccountSettingsPage, CommonModule, RouterLink, RouterLinkActive, IonInput, IonCardHeader, IonCardContent, IonCol, IonRow, IonCard, IonHeader, IonMenuButton, IonToolbar, IonButtons, IonTitle, IonButton, IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonListHeader, IonNote, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterOutlet]
})
export class FolderPage implements OnInit {
  public folder!: string;
  private activatedRoute = inject(ActivatedRoute);

  constructor(
    private router: Router
  ) {
    addIcons({ peopleOutline, peopleSharp, calendarOutline, calendarSharp, cubeOutline, cubeSharp, settingsOutline, settingsSharp });
  }

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id') as string;
  }

  showSettingsPage() {
    return this.router.url == "/landing/accountsettings";
  }
}
