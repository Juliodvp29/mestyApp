import {
  ChangeDetectionStrategy,
  Component,
  signal,
  inject,
} from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonInput,
  IonItem,
  IonList,
  IonSpinner,
  IonNote,
  IonIcon,
  IonButtons,
  IonBackButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { shieldCheckmarkOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { AuthApiService } from '@core/auth/auth-api.service';
import { ErrorHandlerService } from '@core/errors/error-handler.service';

type TwoFaStep = 'intro' | 'code' | 'done';

@Component({
  selector: 'app-two-fa-setup',
  templateUrl: './two-fa-setup.component.html',
  styleUrls: ['./two-fa-setup.component.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonInput,
    IonItem,
    IonList,
    IonSpinner,
    IonNote,
    IonIcon,
    IonButtons,
    IonBackButton,
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TwoFaSetupComponent {
  private authApi = inject(AuthApiService);
  private errorHandler = inject(ErrorHandlerService);

  readonly step = signal<TwoFaStep>('intro');
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly setupCode = signal('');

  readonly codeForm = new FormGroup({
    code: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\d{6}$/)],
    }),
  });

  constructor() {
    addIcons({ shieldCheckmarkOutline, checkmarkCircleOutline });
  }

  async onInitSetup(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set('');
    try {
      const response = await firstValueFrom(this.authApi.twoFaSetup());
      this.setupCode.set(response.code);
      this.step.set('code');
    } catch (err: unknown) {
      const appError = this.errorHandler.mapHttpError(err as import('@angular/common/http').HttpErrorResponse);
      this.errorMessage.set(appError.message);
    } finally {
      this.isLoading.set(false);
    }
  }

  async onVerifySetup(): Promise<void> {
    if (this.codeForm.invalid) {
      this.codeForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set('');
    try {
      await firstValueFrom(
        this.authApi.twoFaSetupVerify({ code: this.codeForm.controls.code.value })
      );
      this.step.set('done');
    } catch (err: unknown) {
      const appError = this.errorHandler.mapHttpError(err as import('@angular/common/http').HttpErrorResponse);
      this.errorMessage.set(appError.message);
    } finally {
      this.isLoading.set(false);
    }
  }
}
