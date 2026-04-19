import {
  ChangeDetectionStrategy,
  Component,
  signal,
  inject,
  OnInit,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonIcon,
  IonButtons,
  IonBackButton,
  IonSkeletonText,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { phonePortraitOutline, desktopOutline, trashOutline } from 'ionicons/icons';
import { AuthApiService } from '@core/auth/auth-api.service';
import { ErrorHandlerService } from '@core/errors/error-handler.service';
import { SessionInfo } from '@core/auth/auth.models';

@Component({
  selector: 'app-sessions',
  templateUrl: './sessions.component.html',
  styleUrls: ['./sessions.component.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonIcon,
    IonButtons,
    IonBackButton,
    IonSkeletonText,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionsComponent implements OnInit {
  private authApi = inject(AuthApiService);
  private errorHandler = inject(ErrorHandlerService);

  readonly sessions = signal<SessionInfo[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');

  constructor() {
    addIcons({ phonePortraitOutline, desktopOutline, trashOutline });
  }

  ngOnInit(): void {
    this.loadSessions();
  }

  async loadSessions(event?: { target: { complete: () => void } }): Promise<void> {
    this.errorMessage.set('');
    if (!event) {
      this.isLoading.set(true);
    }
    try {
      const response = await firstValueFrom(this.authApi.listSessions());
      this.sessions.set(response.sessions);
    } catch (err: unknown) {
      const appError = this.errorHandler.mapHttpError(err as import('@angular/common/http').HttpErrorResponse);
      this.errorMessage.set(appError.message);
    } finally {
      this.isLoading.set(false);
      event?.target.complete();
    }
  }

  async revokeSession(sessionId: string): Promise<void> {
    try {
      await firstValueFrom(this.authApi.deleteSession(sessionId));
      this.sessions.update((list) => list.filter((s) => s.id !== sessionId));
    } catch (err: unknown) {
      const appError = this.errorHandler.mapHttpError(err as import('@angular/common/http').HttpErrorResponse);
      this.errorMessage.set(appError.message);
    }
  }

  getDeviceIcon(deviceType: string): string {
    if (deviceType === 'ios' || deviceType === 'android') {
      return 'phone-portrait-outline';
    }
    return 'desktop-outline';
  }

  formatLastActive(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }
}
