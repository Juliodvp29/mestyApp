import { ChangeDetectionStrategy, Component, inject, effect } from '@angular/core';
import {
  IonApp,
  IonRouterOutlet,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chatbubblesOutline, chatbubbles, settingsOutline, settings } from 'ionicons/icons';
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
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly authService = inject(AuthService);
  private readonly wsService = inject(WebSocketService);
  private readonly dispatcher = inject(WsEventDispatcherService);

  constructor() {
    addIcons({ chatbubblesOutline, chatbubbles, settingsOutline, settings });
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
