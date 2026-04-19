import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { 
  IonApp, 
  IonRouterOutlet, 
  IonSplitPane, 
  IonMenu, 
  IonContent, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonHeader, 
  IonToolbar, 
  IonTitle
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    IonApp, 
    IonRouterOutlet, 
    IonSplitPane, 
    IonMenu, 
    IonContent, 
    IonList, 
    IonItem, 
    IonLabel, 
    IonHeader, 
    IonToolbar, 
    IonTitle,
    RouterLink
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  constructor() {}
}
