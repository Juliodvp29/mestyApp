import { Injectable, signal, computed } from '@angular/core';
import {
  AuthTokenResponse,
  AuthUser,
} from '@core/auth/auth.models';

const ACCESS_TOKEN_KEY = 'mesty_access_token';
const REFRESH_TOKEN_KEY = 'mesty_refresh_token';
const USER_KEY = 'mesty_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly accessToken = signal<string | null>(this.loadFromStorage(ACCESS_TOKEN_KEY));
  private readonly refreshTokenValue = signal<string | null>(this.loadFromStorage(REFRESH_TOKEN_KEY));
  private readonly currentUser = signal<AuthUser | null>(this.loadUserFromStorage());

  readonly isAuthenticated = computed(() => !!this.accessToken());
  readonly user = computed(() => this.currentUser());

  getAccessToken(): string | null {
    return this.accessToken();
  }

  getRefreshToken(): string | null {
    return this.refreshTokenValue();
  }

  setSession(response: AuthTokenResponse): void {
    this.accessToken.set(response.access_token);
    this.refreshTokenValue.set(response.refresh_token);
    this.currentUser.set(response.user);

    this.saveToStorage(ACCESS_TOKEN_KEY, response.access_token);
    this.saveToStorage(REFRESH_TOKEN_KEY, response.refresh_token);
    this.saveToStorage(USER_KEY, JSON.stringify(response.user));
  }

  updateTokens(accessToken: string, refreshToken: string): void {
    this.accessToken.set(accessToken);
    this.refreshTokenValue.set(refreshToken);

    this.saveToStorage(ACCESS_TOKEN_KEY, accessToken);
    this.saveToStorage(REFRESH_TOKEN_KEY, refreshToken);
  }

  clearSession(): void {
    this.accessToken.set(null);
    this.refreshTokenValue.set(null);
    this.currentUser.set(null);

    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  private loadFromStorage(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private loadUserFromStorage(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private saveToStorage(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Storage unavailable (SSR, private mode, etc.)
    }
  }
}
