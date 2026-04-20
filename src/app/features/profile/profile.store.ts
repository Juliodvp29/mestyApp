import { Injectable, inject, signal, computed } from '@angular/core';
import { ProfileService } from './profile.service';
import { UserProfile, UpdateProfileRequest, BlockRecord } from './profile.models';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProfileStore {
  private profileService = inject(ProfileService);

  // State
  private _myProfile = signal<UserProfile | null>(null);
  private _blockedUsers = signal<BlockRecord[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  // Selectors
  readonly myProfile = computed(() => this._myProfile());
  readonly blockedUsers = computed(() => this._blockedUsers());
  readonly loading = computed(() => this._loading());
  readonly error = computed(() => this._error());

  async loadMyProfile(): Promise<void> {
    this._loading.set(true);
    try {
      const profile = await firstValueFrom(this.profileService.getMyProfile());
      this._myProfile.set(profile);
    } catch (err: any) {
      this._error.set(err.error?.message || 'Failed to load profile');
    } finally {
      this._loading.set(false);
    }
  }

  async updateProfile(payload: UpdateProfileRequest): Promise<void> {
    this._loading.set(true);
    try {
      const updated = await firstValueFrom(this.profileService.updateMyProfile(payload));
      this._myProfile.set(updated);
    } catch (err: any) {
      this._error.set(err.error?.message || 'Failed to update profile');
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  async loadBlockedUsers(): Promise<void> {
    try {
      const response = await firstValueFrom(this.profileService.getBlockedUsers());
      this._blockedUsers.set(response.blocks);
    } catch (err: any) {
      console.error('Failed to load blocked users', err);
    }
  }

  async blockUser(id: string): Promise<void> {
    try {
      const block = await firstValueFrom(this.profileService.blockUser(id));
      this._blockedUsers.update(blocks => [...blocks, block]);
    } catch (err: any) {
      this._error.set(err.error?.message || 'Failed to block user');
      throw err;
    }
  }

  async unblockUser(id: string): Promise<void> {
    try {
      await firstValueFrom(this.profileService.unblockUser(id));
      this._blockedUsers.update(blocks => blocks.filter(b => b.blocked_id !== id));
    } catch (err: any) {
      this._error.set(err.error?.message || 'Failed to unblock user');
      throw err;
    }
  }
}
