import { Injectable } from "@angular/core";
import { AppPage } from "./models/appPage.model";

@Injectable({
  providedIn: 'root'
})
export class AppPages {
  public pages: AppPage[] = [
    { id: 'accountsettings', title: 'Account Settings', url: '/landing/accountsettings', icon: 'settings' },
    { id: 'customers', title: 'Customers', url: '/landing/customers', icon: 'people' },
    { id: 'schedule',  title: 'Schedule', url: '/landing/schedule', icon: 'calendar' },
    { id: 'lots', title: 'Lots', url: '/landing/lots', icon: 'cube' },
  ];

  constructor() {}

  getPage(pageUrl: string): AppPage | null {
    let returnPage = null;
    this.pages.forEach(page => {
      if (pageUrl == page.url) {
        returnPage = page;
      }
    });
    return returnPage;
  };
}