import {
  ChangeDetectionStrategy,
  Component,
  computed,
  OnInit,
  signal,
  inject,
  ViewChild,
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
import { OtpInputComponent } from '@shared/components/otp-input/otp-input.component';

type LoginStep = 'phone' | 'otp' | 'twofa';

const LOCALE_TO_COUNTRY_CODE: Record<string, string> = {
  'es-CO': '+57', 'es-MX': '+52', 'es-AR': '+54', 'es-PE': '+51',
  'es-VE': '+58', 'es-CL': '+56', 'es-EC': '+593', 'es-GT': '+502',
  'es-CU': '+53', 'es-BO': '+591', 'es-DO': '+1', 'es-HN': '+504',
  'es-PY': '+595', 'es-SV': '+503', 'es-UY': '+598', 'es-PA': '+507',
  'es-CR': '+506', 'es-PR': '+1', 'es-NI': '+505', 'es-GQ': '+240',
  'es-ES': '+34', 'en-US': '+1', 'en-GB': '+44', 'en-AU': '+61',
  'en-CA': '+1', 'pt-BR': '+55', 'pt-PT': '+351', 'fr-FR': '+33',
  'de-DE': '+49', 'it-IT': '+39', 'ja-JP': '+81', 'ko-KR': '+82',
  'zh-CN': '+86', 'zh-TW': '+886',
};

function detectCountryCode(): string {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale
    ?? navigator.language
    ?? '';
  if (LOCALE_TO_COUNTRY_CODE[locale]) {
    return LOCALE_TO_COUNTRY_CODE[locale];
  }
  const lang = locale.split('-')[0];
  const match = Object.keys(LOCALE_TO_COUNTRY_CODE).find(k => k.startsWith(lang + '-'));
  return match ? LOCALE_TO_COUNTRY_CODE[match] : '+1';
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonButton,
    IonInput,
    IonText,
    IonSpinner,
    IonNote,
    RouterLink,
    ReactiveFormsModule,
    OtpInputComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  @ViewChild('otpRef') otpRef?: OtpInputComponent;
  @ViewChild('twoFaRef') twoFaRef?: OtpInputComponent;

  private authApi = inject(AuthApiService);
  private errorHandler = inject(ErrorHandlerService);
  private router = inject(Router);

  readonly step = signal<LoginStep>('phone');
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly countryCode = signal('+1');
  readonly phoneNumber = signal('');
  private tempToken = signal('');

  readonly otpCode = signal('');
  readonly twoFaCode = signal('');

  readonly fullPhone = computed(() => `${this.countryCode()}${this.phoneNumber()}`);

  readonly phoneForm = new FormGroup({
    phone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\+[1-9]\d{7,14}$/)],
    }),
  });

  ngOnInit(): void {
    const detected = detectCountryCode();
    this.countryCode.set(detected);
    this.phoneForm.controls.phone.setValue(detected);
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let val = input.value;
    if (!val.startsWith(this.countryCode())) {
      val = this.countryCode() + val.replace(/^\+\d+/, '');
      input.value = val;
    }
    this.phoneForm.controls.phone.setValue(val);
  }

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
    const code = this.otpCode();
    if (code.length !== 6) {
      this.otpRef?.shakeError();
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set('');
    try {
      const response = await firstValueFrom(
        this.authApi.loginVerify({
          phone: this.phoneForm.controls.phone.value,
          code,
          device_id: getDeviceId(),
          device_name: getDeviceName(),
          device_type: getDeviceType(),
        })
      );
      if (isTwoFaRequired(response)) {
        this.tempToken.set(response.temp_token);
        this.step.set('twofa');
      } else {
        this.router.navigate(['/tabs/chats']);
      }
    } catch (err: unknown) {
      const appError = this.errorHandler.mapHttpError(err as import('@angular/common/http').HttpErrorResponse);
      this.errorMessage.set(appError.message);
      this.otpRef?.shakeError();
    } finally {
      this.isLoading.set(false);
    }
  }

  async onVerify2Fa(): Promise<void> {
    const code = this.twoFaCode();
    if (code.length !== 6) {
      this.twoFaRef?.shakeError();
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set('');
    try {
      await firstValueFrom(
        this.authApi.twoFaVerify({
          temp_token: this.tempToken(),
          code,
          device_id: getDeviceId(),
          device_name: getDeviceName(),
          device_type: getDeviceType(),
        })
      );
      this.router.navigate(['/tabs/chats']);
    } catch (err: unknown) {
      const appError = this.errorHandler.mapHttpError(err as import('@angular/common/http').HttpErrorResponse);
      this.errorMessage.set(appError.message);
      this.twoFaRef?.shakeError();
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
