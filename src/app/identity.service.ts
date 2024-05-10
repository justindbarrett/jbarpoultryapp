import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { UserDetails } from './models/userDetails.model';
import { AuthenticationService } from './authentication.service';
import { Observable, Subject, Subscription } from 'rxjs';
import { StorageService } from './storage.service';
import { Consts } from './consts';

@Injectable({
  providedIn: 'root'
})
export class IdentityService implements OnDestroy {

  private currentUser: UserDetails | null = null;
  private identityObservable = new Subject<UserDetails>();
  private authStateSubscription = new Subscription();

  constructor(
    private authService: AuthenticationService,
    private storageService: StorageService,
    private consts: Consts
  ) {
      this.authStateSubscription = this.authService.getAuthStateObservable().subscribe((authUser) => {
        console.log(`Auth User: ${JSON.stringify(authUser)}`);
        if (authUser) {
          const userDetails = { 
            displayName: authUser.displayName, 
            emailAddress: authUser.email,
            userId: authUser.uid,
            emailVerified: authUser.emailVerified
          };
          this.setUserDetails(userDetails);
        }
        else {
          this.clearUserDetails();
        }
      });
  }

  ngOnDestroy(): void {
    this.authStateSubscription.unsubscribe();
  }

  public setUserDetails(userDetails: UserDetails) {
    this.currentUser = userDetails;
    this.storageService.set(this.consts.USERDETAILS.USER_ID, this.currentUser.userId);
    this.identityObservable.next(this.currentUser);
    console.log(`Current User: ${JSON.stringify(this.currentUser)}`);
  }

  public updateUserName(newName: string) {
    const userDetails: UserDetails = { 
      displayName: newName, 
      emailAddress: this.currentUser?.emailAddress || null,
      userId: this.currentUser?.userId || "",
      emailVerified: this.currentUser?.emailVerified || false
    };
    this.setUserDetails(userDetails);
  }

  public clearUserDetails() {
    this.currentUser = null;
    this.storageService.remove(this.consts.USERDETAILS.USER_ID);
  }

  public getUserDetails(): UserDetails | null {
    return this.currentUser; 
  }

  public getUserDetailsObservable(): Observable<UserDetails> {
    return this.identityObservable.asObservable();
  }

}
