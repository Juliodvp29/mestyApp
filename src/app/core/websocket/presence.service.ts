import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PresenceService {
  private readonly onlineSet = signal<Set<string>>(new Set());

  readonly onlineUsers = computed(() => this.onlineSet());

  markOnline(userId: string): void {
    this.onlineSet.update((set) => {
      const updated = new Set(set);
      updated.add(userId);
      return updated;
    });
  }

  markOffline(userId: string): void {
    this.onlineSet.update((set) => {
      const updated = new Set(set);
      updated.delete(userId);
      return updated;
    });
  }

  isOnline(userId: string): boolean {
    return this.onlineSet().has(userId);
  }
}
