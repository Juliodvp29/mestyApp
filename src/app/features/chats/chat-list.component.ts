import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonBadge,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
  IonIcon,
  IonButton,
  IonButtons,
  IonSearchbar,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { createOutline, searchOutline, lockClosedOutline, cameraOutline, addOutline, trashOutline, archiveOutline } from 'ionicons/icons';
import { ChatStore } from '@features/chats/chat.store';
import { PresenceService } from '@core/websocket/presence.service';
import { TypingService } from '@core/websocket/typing.service';
import { AuthService } from '@core/auth/auth.service';
import { StoriesBarComponent } from '../stories/stories-bar/stories-bar.component';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonAvatar,
    IonBadge,
    IonRefresher,
    IonRefresherContent,
    IonSkeletonText,
    IonIcon,
    IonButton,
    IonButtons,
    IonSearchbar,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    StoriesBarComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatListComponent implements OnInit {
  readonly chatStore: ChatStore = inject(ChatStore);
  readonly presenceService: PresenceService = inject(PresenceService);
  readonly typingService: TypingService = inject(TypingService);
  readonly authService: AuthService = inject(AuthService);
  private readonly router: Router = inject(Router);

  readonly skeletonItems = [1, 2, 3, 4, 5, 6, 7];
  readonly currentUserId = signal(this.authService.user()?.id ?? '');
  readonly searchQuery = signal('');

  readonly filteredPinnedChats = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.chatStore.pinnedChats();
    return this.chatStore.pinnedChats().filter(c =>
      this.getChatName(c).toLowerCase().includes(query)
    );
  });

  readonly filteredUnpinnedChats = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.chatStore.unpinnedChats();
    return this.chatStore.unpinnedChats().filter(c =>
      this.getChatName(c).toLowerCase().includes(query)
    );
  });

  constructor() {
    addIcons({ createOutline, searchOutline, lockClosedOutline, cameraOutline, addOutline, trashOutline, archiveOutline });
  }

  ngOnInit(): void {
    this.chatStore.loadChats();
  }

  async onRefresh(event: { target: { complete: () => void } }): Promise<void> {
    await this.chatStore.loadChats();
    event.target.complete();
  }

  onSearchInput(event: CustomEvent): void {
    this.searchQuery.set((event.detail.value as string) ?? '');
  }

  openChat(chatId: string): void {
    this.router.navigate(['/tabs/chats', chatId]);
  }

  getChatName(chat: ReturnType<typeof this.chatStore.chats>[number]): string {
    return chat.name ?? 'Direct Message';
  }

  getInitial(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  getAvatarClass(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % 6;
    return `mesty-avatar-${index}`;
  }

  getTypingText(chatId: string): string {
    const users = this.typingService.typingUsers()[chatId];
    if (!users || users.length === 0) return '';
    if (users.length === 1) return 'typing…';
    return `${users.length} people typing…`;
  }

  formatTime(dateStr: string | null): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}
