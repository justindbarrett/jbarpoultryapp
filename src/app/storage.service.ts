import { Injectable, OnDestroy } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { Subscription } from 'rxjs';
import { Storage } from '@ionic/storage-angular';
import { Consts } from './consts';

@Injectable({
  providedIn: 'root'
})
export class StorageService implements OnDestroy {

  private authStateSubscription = new Subscription();
  private _storage: Storage | null = null;

  constructor(
    private authService: AuthenticationService,
    private storage: Storage,
    private consts: Consts) {
      this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
    this.authStateSubscription = this.authService.getAuthStateObservable().subscribe((authUser) => {
      if (authUser) {
        this.set(this.consts.USERDETAILS.USER_ID, authUser.uid);
        localStorage.setItem('isAuthenticated', 'true');
      }
      else {
        this._storage?.remove(this.consts.USERDETAILS.USER_ID);
        localStorage.removeItem('isAuthenticated');
      }
    });
  }

  ngOnDestroy(): void {
    this.authStateSubscription.unsubscribe();
  }

  public async set(key: string, value: string) {
    await this._storage?.set(key, value);
  }

  public async get(key: string): Promise<string>{
    return await this._storage?.get(key);
  }

  public async remove(key: string) {
    await this._storage?.remove(key);
  }
}