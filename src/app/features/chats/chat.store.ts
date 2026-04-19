import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment';
import {
  ChatPreview,
  ChatListResponse,
  ChatMessage,
  MessageListResponse,
  SendMessageRequest,
  CreateChatRequest,
  ChatDetail,
} from '@features/chats/chat.models';
import {
  WsNewMessagePayload,
  WsMessageEditedPayload,
  WsMessageDeletedPayload,
  WsReactionAddedPayload,
  WsReactionRemovedPayload,
  WsMessagesReadPayload,
} from '@core/websocket/ws.models';

@Injectable({ providedIn: 'root' })
export class ChatStore {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/chats`;

  private readonly chatList = signal<ChatPreview[]>([]);
  private readonly isLoadingList = signal(false);
  private readonly listError = signal('');

  readonly chats = computed(() => this.chatList());
  readonly loading = computed(() => this.isLoadingList());
  readonly error = computed(() => this.listError());

  pinnedChats = computed(() =>
    this.chatList().filter((c) => c.is_pinned).sort((a, b) => a.pin_order - b.pin_order)
  );

  unpinnedChats = computed(() =>
    this.chatList()
      .filter((c) => !c.is_pinned && !c.is_archived)
      .sort((a, b) => {
        const dateA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
        const dateB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
        return dateB - dateA;
      })
  );

  totalUnread = computed(() =>
    this.chatList().reduce((sum, c) => sum + c.unread_count, 0)
  );

  async loadChats(cursor?: string): Promise<void> {
    this.isLoadingList.set(true);
    this.listError.set('');
    try {
      const params = new URLSearchParams({ limit: '30' });
      if (cursor) params.set('cursor', cursor);
      const response = await firstValueFrom(
        this.http.get<ChatListResponse>(`${this.baseUrl}?${params}`)
      );
      if (cursor) {
        this.chatList.update((list) => [...list, ...response.items]);
      } else {
        this.chatList.set(response.items);
      }
    } catch {
      this.listError.set('Could not load chats. Pull down to retry.');
    } finally {
      this.isLoadingList.set(false);
    }
  }

  async loadMessages(chatId: string, cursor?: string): Promise<MessageListResponse> {
    const params = new URLSearchParams({ limit: '50', direction: 'before' });
    if (cursor) params.set('cursor', cursor);
    return firstValueFrom(
      this.http.get<MessageListResponse>(`${this.baseUrl}/${chatId}/messages?${params}`)
    );
  }

  async sendMessage(chatId: string, payload: SendMessageRequest): Promise<ChatMessage> {
    return firstValueFrom(
      this.http.post<ChatMessage>(`${this.baseUrl}/${chatId}/messages`, payload)
    );
  }

  async createChat(payload: CreateChatRequest): Promise<ChatDetail> {
    return firstValueFrom(this.http.post<ChatDetail>(this.baseUrl, payload));
  }

  async markRead(chatId: string, upTo: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${this.baseUrl}/${chatId}/messages/read`, { up_to: upTo })
    );
    this.chatList.update((list) =>
      list.map((c) => (c.chat_id === chatId ? { ...c, unread_count: 0 } : c))
    );
  }

  handleNewMessage(payload: WsNewMessagePayload): void {
    this.chatList.update((list) =>
      list.map((c) => {
        if (c.chat_id !== payload.chat_id) return c;
        return {
          ...c,
          last_message_id: payload.message.id,
          last_message_encrypted: payload.message.content_encrypted,
          last_sender_id: payload.message.sender_id,
          last_message_at: payload.message.created_at,
          unread_count: c.unread_count + 1,
        };
      })
    );
  }

  handleMessageEdited(payload: WsMessageEditedPayload): void {
    this.chatList.update((list) =>
      list.map((c) => {
        if (c.chat_id !== payload.chat_id) return c;
        if (c.last_message_id !== payload.message_id) return c;
        return {
          ...c,
          last_message_encrypted: payload.content_encrypted,
        };
      })
    );
  }

  handleMessageDeleted(_payload: WsMessageDeletedPayload): void {
    this.loadChats();
  }

  handleReactionAdded(_payload: WsReactionAddedPayload): void {}

  handleReactionRemoved(_payload: WsReactionRemovedPayload): void {}

  handleMessagesRead(_payload: WsMessagesReadPayload): void {}

  markChatRead(chatId: string): void {
    this.chatList.update((list) =>
      list.map((c) => (c.chat_id === chatId ? { ...c, unread_count: 0 } : c))
    );
  }

  getChatById(chatId: string): ChatPreview | undefined {
    return this.chatList().find((c) => c.chat_id === chatId);
  }
}
