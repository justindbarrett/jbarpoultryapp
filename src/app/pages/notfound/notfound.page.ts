import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonHeader, IonTitle } from '@ionic/angular/standalone';

@Component({
  selector: 'not-found',
  templateUrl: './notfound.page.html',
  standalone: true,
  imports: [ RouterLink, IonHeader, IonTitle ]
})
export class NotFoundPage {

  constructor(
  ) { }
}
