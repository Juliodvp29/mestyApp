import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonAvatar,
  IonToggle,
  IonNote,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personCircleOutline,
  lockClosedOutline,
  notificationsOutline,
  moonOutline,
  shieldCheckmarkOutline,
  informationCircleOutline,
  logOutOutline,
  phonePortraitOutline,
  chevronForward,
} from 'ionicons/icons';
import { AuthService } from '@core/auth/auth.service';
import { ProfileStore } from '@features/profile/profile.store';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonAvatar,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  readonly authService = inject(AuthService);
  readonly profileStore = inject(ProfileStore);
  private readonly router = inject(Router);

  constructor() {
    addIcons({
      personCircleOutline,
      lockClosedOutline,
      notificationsOutline,
      moonOutline,
      shieldCheckmarkOutline,
      informationCircleOutline,
      logOutOutline,
      phonePortraitOutline,
      chevronForward,
    });
  }

  openProfile(): void {
    this.router.navigate(['/profile']);
  }

  openSessions(): void {
    this.router.navigate(['/auth/sessions']);
  }

  open2FA(): void {
    this.router.navigate(['/auth/two-fa-setup']);
  }

  openContacts(): void {
    this.router.navigate(['/contacts']);
  }

  async logout(): Promise<void> {
    this.authService.clearSession();
    await this.router.navigate(['/auth/login']);
  }

  getInitial(): string {
    const name = this.profileStore.myProfile()?.display_name ?? '';
    return name.charAt(0).toUpperCase() || '?';
  }
}
