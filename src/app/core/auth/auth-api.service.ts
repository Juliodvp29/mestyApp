import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '@env/environment';
import { AuthService } from '@core/auth/auth.service';
import {
  RegisterRequest,
  VerifyPhoneRequest,
  LoginRequest,
  LoginVerifyRequest,
  LoginVerifyResponse,
  TwoFaVerifyRequest,
  RefreshTokenRequest,
  RecoverRequest,
  RecoverVerifyRequest,
  TwoFaSetupVerifyRequest,
  AuthTokenResponse,
  TwoFaSetupResponse,
  RecoverTokenResponse,
  MessageResponse,
  SessionListResponse,
} from '@core/auth/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private baseUrl = `${environment.apiUrl}/auth`;

  register(payload: RegisterRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/register`, payload);
  }

  verifyPhone(payload: VerifyPhoneRequest): Observable<AuthTokenResponse> {
    return this.http.post<AuthTokenResponse>(`${this.baseUrl}/verify-phone`, payload).pipe(
      tap((response) => this.authService.setSession(response))
    );
  }

  login(payload: LoginRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/login`, payload);
  }

  loginVerify(payload: LoginVerifyRequest): Observable<LoginVerifyResponse> {
    return this.http.post<LoginVerifyResponse>(`${this.baseUrl}/login/verify`, payload).pipe(
      tap((response) => {
        if (!('two_fa_required' in response)) {
          this.authService.setSession(response);
        }
      })
    );
  }

  twoFaVerify(payload: TwoFaVerifyRequest): Observable<AuthTokenResponse> {
    return this.http.post<AuthTokenResponse>(`${this.baseUrl}/2fa/verify`, payload).pipe(
      tap((response) => this.authService.setSession(response))
    );
  }

  twoFaSetup(): Observable<TwoFaSetupResponse> {
    return this.http.post<TwoFaSetupResponse>(`${this.baseUrl}/2fa/setup`, {});
  }

  twoFaSetupVerify(payload: TwoFaSetupVerifyRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/2fa/setup/verify`, payload);
  }

  refreshToken(payload: RefreshTokenRequest): Observable<AuthTokenResponse> {
    return this.http.post<AuthTokenResponse>(`${this.baseUrl}/refresh`, payload);
  }

  recover(payload: RecoverRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/recover`, payload);
  }

  recoverVerify(payload: RecoverVerifyRequest): Observable<RecoverTokenResponse> {
    return this.http.post<RecoverTokenResponse>(`${this.baseUrl}/recover/verify`, payload);
  }

  logout(): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/logout`, {}).pipe(
      tap(() => this.authService.clearSession())
    );
  }

  listSessions(): Observable<SessionListResponse> {
    return this.http.get<SessionListResponse>(`${this.baseUrl}/sessions`);
  }

  deleteSession(sessionId: string): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.baseUrl}/sessions/${sessionId}`);
  }
}
