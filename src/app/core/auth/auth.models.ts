export interface RegisterRequest {
  phone: string;
  device_id: string;
  device_name: string;
  device_type: string;
}

export interface VerifyPhoneRequest {
  phone: string;
  code: string;
  device_id?: string;
  device_name?: string;
  device_type?: string;
  push_token?: string;
}

export interface LoginRequest {
  phone: string;
  device_id: string;
  device_name: string;
  device_type: string;
  push_token?: string;
}

export interface LoginVerifyRequest {
  phone: string;
  code: string;
  device_id: string;
  device_name: string;
  device_type: string;
  push_token?: string;
}

export interface TwoFaVerifyRequest {
  temp_token: string;
  code: string;
  device_id: string;
  device_name: string;
  device_type: string;
  push_token?: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RecoverRequest {
  phone: string;
}

export interface RecoverVerifyRequest {
  phone: string;
  code: string;
}

export interface TwoFaSetupVerifyRequest {
  code: string;
}

export interface AuthUser {
  id: string;
  phone: string;
  username: string | null;
}

export interface AuthTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: AuthUser;
}

export interface TwoFaRequiredResponse {
  two_fa_required: true;
  temp_token: string;
}

export interface TwoFaSetupResponse {
  message: string;
  code: string;
}

export interface RecoverTokenResponse {
  recover_token: string;
}

export interface SessionInfo {
  id: string;
  device_name: string;
  device_type: string;
  ip_address: string;
  last_active_at: string;
  is_current: boolean;
}

export interface SessionListResponse {
  sessions: SessionInfo[];
}

export interface MessageResponse {
  message: string;
}

export type LoginVerifyResponse = AuthTokenResponse | TwoFaRequiredResponse;

export function isTwoFaRequired(response: LoginVerifyResponse): response is TwoFaRequiredResponse {
  return 'two_fa_required' in response && response.two_fa_required === true;
}
