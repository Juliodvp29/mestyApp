import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  UserProfile,
  UpdateProfileRequest,
  UserSearchResponse,
  BlockListResponse,
  BlockRecord
} from './profile.models';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);
  private userUrl = `${environment.apiUrl}/users`;
  private blockUrl = `${environment.apiUrl}/blocks`;

  getMyProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.userUrl}/me/profile`);
  }

  getUserProfile(id: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.userUrl}/${id}/profile`);
  }

  updateMyProfile(payload: UpdateProfileRequest): Observable<UserProfile> {
    // Note: Assuming PATCH /users/me/profile as per typical REST patterns and Phase 6.4 requirements
    return this.http.patch<UserProfile>(`${this.userUrl}/me/profile`, payload);
  }

  searchUsers(query: string, limit: number = 20): Observable<UserSearchResponse[]> {
    return this.http.get<UserSearchResponse[]>(`${this.userUrl}/search`, {
      params: { q: query, limit }
    });
  }

  getBlockedUsers(): Observable<BlockListResponse> {
    return this.http.get<BlockListResponse>(this.blockUrl);
  }

  blockUser(id: string): Observable<BlockRecord> {
    return this.http.post<BlockRecord>(`${this.blockUrl}/${id}`, {});
  }

  unblockUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.blockUrl}/${id}`);
  }
}
