import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButton, 
  IonIcon, 
  IonButtons 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { createOutline, arrowForwardOutline } from 'ionicons/icons';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss'],
  standalone: true,
  imports: [
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonButton, 
    IonIcon, 
    IonButtons
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatListComponent {
  readonly title = signal('Messages');

  constructor() {
    addIcons({ createOutline, arrowForwardOutline });
  }
}
