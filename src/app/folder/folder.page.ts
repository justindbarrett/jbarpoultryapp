import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonTitle, IonMenuButton, IonToolbar, IonButtons, IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonListHeader, IonNote, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterOutlet, IonHeader, IonButton } from '@ionic/angular/standalone';
import { AppShellComponent } from '../app-shell/app-shell.component';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { calendarOutline, calendarSharp, cubeOutline, cubeSharp, peopleOutline, peopleSharp, settingsOutline, settingsSharp } from 'ionicons/icons';
import { NavController, AlertController } from '@ionic/angular';
import { IdentityService } from '../identity.service';
import { AuthenticationService } from '../authentication.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IonHeader, IonMenuButton, IonToolbar, IonButtons, IonTitle, IonButton, IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonListHeader, IonNote, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterOutlet]
})
export class FolderPage implements OnInit, OnDestroy {
  public folder!: string;
  private activatedRoute = inject(ActivatedRoute);
  public appPages = [
    { title: 'Customers', url: '/folder/customers', icon: 'people' },
    { title: 'Schedule', url: '/folder/schedule', icon: 'calendar' },
    { title: 'Lots', url: '/folder/lots', icon: 'cube' },
  ];
  public userDisplayName = "";
  public userEmail = "";
  private userDetailsSubscription = new Subscription();

  constructor(
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private identityService: IdentityService,
    private authService: AuthenticationService
  ) {
    addIcons({ peopleOutline, peopleSharp, calendarOutline, calendarSharp, cubeOutline, cubeSharp, settingsOutline, settingsSharp });
  }

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id') as string;
    this.userDetailsSubscription = this.identityService.getUserDetailsObservable().subscribe((userDetails) => {
      this.userDisplayName = userDetails.displayName;
      this.userEmail = userDetails.emailAddress;
    });
  }

  ngOnDestroy(): void {
    this.userDetailsSubscription.unsubscribe();
  }

  logOut() {
    console.log("logging out");
    this.authService.logOutUser()
      .then(auth => {
        console.log(`User Auth: ${JSON.stringify(auth)}`);
        const userDetails = { displayName: "", emailAddress: "" };
        this.identityService.setUserDetails(userDetails);
        this.navCtrl.navigateBack("login");
      })
      .catch(err => { console.log(JSON.stringify(err)); this.presentAlert(err.code); })
  }

  gotoSettings() {
    console.log("Go to settings");
  }

  async presentAlert(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Failed Log Out Attempt',
      message: message,
      buttons: ['Try Again'],
    });

    await alert.present();
  }
}
