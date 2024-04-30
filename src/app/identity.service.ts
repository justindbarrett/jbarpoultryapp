import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { UserDetails } from './models/userDetails.model';
import { AuthenticationService } from './authentication.service';
import { Observable, Subject, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IdentityService implements OnDestroy {

  private currentUser: UserDetails = {
    displayName: "", emailAddress: ""
  };
  private identityObservable = new Subject<UserDetails>();
  private authStateSubscription = new Subscription();

  constructor(
    private authService: AuthenticationService) {
      this.authStateSubscription = this.authService.getAuthStateObservable().subscribe((authUser) => {
        console.log(`Auth User: ${JSON.stringify(authUser)}`);
        const userDetails = { displayName: authUser?.displayName || "", emailAddress: authUser?.email || "" };
        this.setUserDetails(userDetails);
      });
  }

  ngOnDestroy(): void {
    this.authStateSubscription.unsubscribe();
  }

  public setUserDetails(userDetails: UserDetails) {
    this.currentUser = userDetails;
    this.identityObservable.next(this.currentUser);
    console.log(`Current User: ${JSON.stringify(this.currentUser)}`);
  }

  public getUserDetails(): UserDetails {
    return this.currentUser; 
  }

  public getUserDetailsObservable(): Observable<UserDetails> {
    return this.identityObservable.asObservable();
  }

}
