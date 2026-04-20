import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chatbubblesOutline, chatbubbles, settingsOutline, settings } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.component.html',
  styleUrls: ['tabs.component.scss'],
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsComponent {
  constructor() {
    addIcons({ chatbubblesOutline, chatbubbles, settingsOutline, settings });
  }
}
