import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { 
  IonApp,
  IonSplitPane,
  IonButton,
  IonMenu,
  IonContent,
  IonList,
  IonListHeader,
  IonNote,
  IonMenuToggle,
  IonItem, 
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  calendarOutline,
  calendarSharp,
  cubeOutline,
  cubeSharp,
  peopleOutline,
  peopleSharp,
  settingsOutline,
  settingsSharp } from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { IdentityService } from './identity.service';
import { AuthenticationService } from './authentication.service';
import { NavController, AlertController } from '@ionic/angular';
import { AppPages } from './pages.service';
import { UsersService } from './users.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    CommonModule,
    IonApp,
    IonSplitPane,
    IonMenu,
    IonContent,
    IonList,
    IonListHeader,
    IonNote,
    IonMenuToggle,
    IonItem,
    IonIcon,
    IonLabel,
    IonRouterOutlet,
    IonButton,
    IonSpinner
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  private allPages = [
    { title: 'Customers', url: '/landing/customers', icon: 'people', allowedRoles: ['admin', 'service'] },
    { title: 'Schedule', url: '/landing/schedule', icon: 'calendar', allowedRoles: ['admin', 'service'] },
    { title: 'Lots', url: '/landing/lots', icon: 'cube', allowedRoles: ['admin', 'service', 'inspector'] },
  ];
  public appPages: typeof this.allPages = [];
  public settingsUrl = 'landing/accountsettings';
  public userDisplayName = '';
  public loading = true;
  public userRole: string = '';
  private userDetailsSubscription = new Subscription();

  constructor(
    private router: Router,
    private identityService: IdentityService,
    private authService: AuthenticationService,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private pageService: AppPages,
    private usersService: UsersService
  ) {
    addIcons({ peopleOutline, peopleSharp, calendarOutline, calendarSharp, cubeOutline, cubeSharp, settingsOutline, settingsSharp });
  }

  ngOnInit() {
    this.loading = true;
    this.userDetailsSubscription = this.identityService.getUserDetailsObservable().subscribe(
      (userDetails) => {
        this.userDisplayName = userDetails.displayName || "";
        this.fetchUserRole();
      }
    );
  }

  fetchUserRole() {
    const user = this.identityService.getUserDetails();
    if (user?.userId) {
      this.usersService.getUserByUserId(user.userId).subscribe(
        (response) => {
          this.userRole = response?.data?.role || 'service';
          localStorage.setItem('userRole', this.userRole);
          this.filterMenuByRole();
          this.loading = false;
        },
        (error) => {
          console.error('Error fetching user role:', error);
          this.userRole = 'service';
          localStorage.setItem('userRole', this.userRole);
          this.filterMenuByRole();
          this.loading = false;
        }
      );
    } else {
      this.loading = false;
    }
  }

  filterMenuByRole() {
    this.appPages = this.allPages.filter(page => 
      page.allowedRoles.includes(this.userRole)
    );
  }

  ngOnDestroy(): void {
    this.userDetailsSubscription.unsubscribe();
  }

  showMenu() {
    return this.pageService.getPage(this.router.url);
  }

  gotoSettings() {
    this.navCtrl.navigateForward(this.settingsUrl);
  }

  logOut() {
    this.authService.logOutUser()
      .then(auth => {
        this.identityService.clearUserDetails();
        this.navCtrl.navigateBack("login");
      })
      .catch(err => { this.presentAlert(err.code); })
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
