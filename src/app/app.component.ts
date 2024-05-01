import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { IonApp, IonSplitPane, IonButton, IonMenu, IonContent, IonList, IonListHeader, IonNote, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, calendarSharp, cubeOutline, cubeSharp, peopleOutline, peopleSharp } from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { IdentityService } from './identity.service';
import { AuthenticationService } from './authentication.service';
import { NavController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonListHeader, IonNote, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterOutlet, IonButton],
})
export class AppComponent implements OnInit, OnDestroy {
  public appPages = [
    { title: 'Customers', url: '/folder/customers', icon: 'people' },
    { title: 'Schedule', url: '/folder/schedule', icon: 'calendar' },
    { title: 'Lots', url: '/folder/lots', icon: 'cube' },
  ];
  public userDisplayName = "";
  private userDetailsSubscription = new Subscription();

  constructor(
    private router: Router,
    private identityService: IdentityService,
    private authService: AuthenticationService,
    private navCtrl: NavController,
    private alertCtrl: AlertController
  ) {
    addIcons({ peopleOutline, peopleSharp, calendarOutline, calendarSharp, cubeOutline, cubeSharp });
  }

  ngOnInit(): void {
    this.userDetailsSubscription = this.identityService.getUserDetailsObservable().subscribe((userDetails) => {
      this.userDisplayName = userDetails.displayName;
    });
  }

  ngOnDestroy(): void {
    this.userDetailsSubscription.unsubscribe();
  }

  hideMenu() {
    return !(this.router.url == "/login" || this.router.url == "/forgotpassword" || this.router.url == "/signup");
  }

  gotoSettings() {
    console.log("Go to settings");
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

  async presentAlert(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Failed Log Out Attempt',
      message: message,
      buttons: ['Try Again'],
    });

    await alert.present();
  }
 }
