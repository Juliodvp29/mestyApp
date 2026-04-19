import {
  ChangeDetectionStrategy,
  Component,
  signal,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  IonContent,
  IonButton,
  IonInput,
  IonItem,
  IonList,
  IonText,
  IonSpinner,
  IonNote,
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { AuthApiService } from '@core/auth/auth-api.service';
import { ErrorHandlerService } from '@core/errors/error-handler.service';
import { isTwoFaRequired } from '@core/auth/auth.models';
import { getDeviceId, getDeviceName, getDeviceType } from '@core/utils/device.utils';

type LoginStep = 'phone' | 'otp' | 'twofa';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonButton,
    IonInput,
    IonItem,
    IonList,
    IonText,
    IonSpinner,
    IonNote,
    RouterLink,
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private authApi = inject(AuthApiService);
  private errorHandler = inject(ErrorHandlerService);
  private router = inject(Router);

  readonly step = signal<LoginStep>('phone');
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  private tempToken = signal('');

  readonly phoneForm = new FormGroup({
    phone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\+[1-9]\d{7,14}$/)],
    }),
  });

  readonly otpForm = new FormGroup({
    code: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\d{6}$/)],
    }),
  });

  readonly twoFaForm = new FormGroup({
    code: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\d{6}$/)],
    }),
  });

  async onRequestCode(): Promise<void> {
    if (this.phoneForm.invalid) {
      this.phoneForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set('');
    try {
      await firstValueFrom(
        this.authApi.login({
          phone: this.phoneForm.controls.phone.value,
          device_id: getDeviceId(),
          device_name: getDeviceName(),
          device_type: getDeviceType(),
        })
      );
      this.step.set('otp');
    } catch (err: unknown) {
      const appError = this.errorHandler.mapHttpError(err as import('@angular/common/http').HttpErrorResponse);
      this.errorMessage.set(appError.message);
    } finally {
      this.isLoading.set(false);
    }
  }

  async onVerifyOtp(): Promise<void> {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set('');
    try {
      const response = await firstValueFrom(
        this.authApi.loginVerify({
          phone: this.phoneForm.controls.phone.value,
          code: this.otpForm.controls.code.value,
          device_id: getDeviceId(),
          device_name: getDeviceName(),
          device_type: getDeviceType(),
        })
      );
      if (isTwoFaRequired(response)) {
        this.tempToken.set(response.temp_token);
        this.step.set('twofa');
      } else {
        this.router.navigate(['/chats']);
      }
    } catch (err: unknown) {
      const appError = this.errorHandler.mapHttpError(err as import('@angular/common/http').HttpErrorResponse);
      this.errorMessage.set(appError.message);
    } finally {
      this.isLoading.set(false);
    }
  }

  async onVerify2Fa(): Promise<void> {
    if (this.twoFaForm.invalid) {
      this.twoFaForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set('');
    try {
      await firstValueFrom(
        this.authApi.twoFaVerify({
          temp_token: this.tempToken(),
          code: this.twoFaForm.controls.code.value,
          device_id: getDeviceId(),
          device_name: getDeviceName(),
          device_type: getDeviceType(),
        })
      );
      this.router.navigate(['/chats']);
    } catch (err: unknown) {
      const appError = this.errorHandler.mapHttpError(err as import('@angular/common/http').HttpErrorResponse);
      this.errorMessage.set(appError.message);
    } finally {
      this.isLoading.set(false);
    }
  }

  goBack(): void {
    if (this.step() === 'twofa') {
      this.step.set('otp');
    } else {
      this.step.set('phone');
    }
    this.errorMessage.set('');
  }
}
