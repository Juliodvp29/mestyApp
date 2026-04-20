import { ChangeDetectionStrategy, Component, inject, effect } from '@angular/core';
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
  IonTitle,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chatbubblesOutline, personCircleOutline, peopleOutline } from 'ionicons/icons';
import { AuthService } from '@core/auth/auth.service';
import { WebSocketService } from '@core/websocket/websocket.service';
import { WsEventDispatcherService } from '@core/websocket/ws-event-dispatcher.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
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
    IonIcon,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly authService = inject(AuthService);
  private readonly wsService = inject(WebSocketService);
  private readonly dispatcher = inject(WsEventDispatcherService);

  constructor() {
    addIcons({ chatbubblesOutline, personCircleOutline, peopleOutline });
    this.dispatcher.initialize();

    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.wsService.connect();
      } else {
        this.wsService.disconnect();
      }
    });
  }
}
