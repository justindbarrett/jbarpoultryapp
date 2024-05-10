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

    getPage(pageId: string): AppPage {
      let returnPage = this.pages[0];
      this.pages.forEach(page => {
          if (pageId == page.id)
              returnPage = page;
          }
      );
      return returnPage;
    };
}