import { Injectable, signal, computed, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment';
import { ChatMessage, MessageListResponse } from '@features/chats/chat.models';
import { WebSocketService } from '@core/websocket/websocket.service';
import {
  WsNewMessagePayload,
  WsMessageEditedPayload,
  WsMessageDeletedPayload,
  WsReactionAddedPayload,
  WsReactionRemovedPayload,
} from '@core/websocket/ws.models';

export interface MessageReactionGroup {
  reaction: string;
  count: number;
  user_ids: string[];
  reacted_by_me: boolean;
}

export interface EnrichedMessage extends ChatMessage {
  reaction_groups: MessageReactionGroup[];
}

@Injectable()
export class MessageDetailStore {
  private readonly http = inject(HttpClient);
  private readonly wsService = inject(WebSocketService);
  private readonly destroyRef = inject(DestroyRef);

  private chatId = '';
  private currentUserId = '';

  private readonly messageMap = signal<Map<string, EnrichedMessage>>(new Map());
  private readonly orderedIds = signal<string[]>([]);
  private readonly isLoadingInitial = signal(true);
  private readonly isLoadingMore = signal(false);
  private readonly hasMore = signal(false);
  private readonly nextCursor = signal<string | null>(null);

  readonly messages = computed(() => {
    const map = this.messageMap();
    return this.orderedIds()
      .map((id) => map.get(id))
      .filter((m): m is EnrichedMessage => m !== undefined);
  });

  readonly loading = computed(() => this.isLoadingInitial());
  readonly loadingMore = computed(() => this.isLoadingMore());
  readonly canLoadMore = computed(() => this.hasMore());

  initialize(chatId: string, currentUserId: string): void {
    this.chatId = chatId;
    this.currentUserId = currentUserId;
    this.subscribeToWsEvents();
    this.loadInitial();
  }

  private subscribeToWsEvents(): void {
    this.wsService.events$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (event.type === 'new_message' && event.payload.chat_id === this.chatId) {
          this.handleNewMessage(event.payload);
        } else if (event.type === 'message_edited' && event.payload.chat_id === this.chatId) {
          this.handleMessageEdited(event.payload);
        } else if (event.type === 'message_deleted' && event.payload.chat_id === this.chatId) {
          this.handleMessageDeleted(event.payload);
        } else if (event.type === 'reaction_added' && event.payload.chat_id === this.chatId) {
          this.handleReactionAdded(event.payload);
        } else if (event.type === 'reaction_removed' && event.payload.chat_id === this.chatId) {
          this.handleReactionRemoved(event.payload);
        }
      });
  }

  private async loadInitial(): Promise<void> {
    this.isLoadingInitial.set(true);
    try {
      const response = await firstValueFrom(
        this.http.get<MessageListResponse>(
          `${environment.apiUrl}/chats/${this.chatId}/messages?limit=50&direction=before`
        )
      );
      this.setMessages(response.items);
      this.hasMore.set(response.has_more);
      this.nextCursor.set(response.next_cursor);
    } finally {
      this.isLoadingInitial.set(false);
    }
  }

  async loadOlderMessages(): Promise<void> {
    const cursor = this.nextCursor();
    if (!cursor || this.isLoadingMore()) return;
    this.isLoadingMore.set(true);
    try {
      const response = await firstValueFrom(
        this.http.get<MessageListResponse>(
          `${environment.apiUrl}/chats/${this.chatId}/messages?limit=50&direction=before&cursor=${cursor}`
        )
      );
      this.prependMessages(response.items);
      this.hasMore.set(response.has_more);
      this.nextCursor.set(response.next_cursor);
    } finally {
      this.isLoadingMore.set(false);
    }
  }

  async sendMessage(contentEncrypted: string, contentIv: string, replyToId?: string): Promise<void> {
    const sent = await firstValueFrom(
      this.http.post<ChatMessage>(`${environment.apiUrl}/chats/${this.chatId}/messages`, {
        content_encrypted: contentEncrypted,
        content_iv: contentIv,
        message_type: 'text',
        reply_to_id: replyToId ?? null,
        is_forwarded: false,
      })
    );
    this.appendMessage(this.enrich(sent));
  }

  async deleteMessage(messageId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${environment.apiUrl}/chats/${this.chatId}/messages/${messageId}`)
    );
    this.messageMap.update((map) => {
      const updated = new Map(map);
      const msg = updated.get(messageId);
      if (msg) updated.set(messageId, { ...msg, deleted_at: new Date().toISOString() });
      return updated;
    });
  }

  async addReaction(messageId: string, reaction: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${environment.apiUrl}/chats/${this.chatId}/messages/${messageId}/reactions`, { reaction })
    );
  }

  async removeReaction(messageId: string, reaction: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${environment.apiUrl}/chats/${this.chatId}/messages/${messageId}/reactions/${encodeURIComponent(reaction)}`)
    );
  }

  private handleNewMessage(payload: WsNewMessagePayload): void {
    const msg: ChatMessage = {
      id: payload.message.id,
      chat_id: payload.chat_id,
      sender_id: payload.message.sender_id,
      reply_to_id: null,
      content_encrypted: payload.message.content_encrypted,
      content_iv: null,
      message_type: payload.message.message_type as ChatMessage['message_type'],
      metadata: null,
      is_forwarded: false,
      created_at: payload.message.created_at,
      edited_at: null,
      deleted_at: null,
    };
    this.appendMessage(this.enrich(msg));
  }

  private handleMessageEdited(payload: WsMessageEditedPayload): void {
    this.messageMap.update((map) => {
      const existing = map.get(payload.message_id);
      if (!existing) return map;
      const updated = new Map(map);
      updated.set(payload.message_id, {
        ...existing,
        content_encrypted: payload.content_encrypted,
        edited_at: payload.edited_at,
      });
      return updated;
    });
  }

  private handleMessageDeleted(payload: WsMessageDeletedPayload): void {
    this.messageMap.update((map) => {
      const existing = map.get(payload.message_id);
      if (!existing) return map;
      const updated = new Map(map);
      updated.set(payload.message_id, {
        ...existing,
        deleted_at: new Date().toISOString(),
      });
      return updated;
    });
  }

  private handleReactionAdded(payload: WsReactionAddedPayload): void {
    this.messageMap.update((map) => {
      const msg = map.get(payload.message_id);
      if (!msg) return map;
      const updated = new Map(map);
      const groups = [...msg.reaction_groups];
      const existing = groups.find((g) => g.reaction === payload.reaction);
      if (existing) {
        existing.count++;
        existing.user_ids = [...existing.user_ids, payload.user_id];
        if (payload.user_id === this.currentUserId) existing.reacted_by_me = true;
      } else {
        groups.push({
          reaction: payload.reaction,
          count: 1,
          user_ids: [payload.user_id],
          reacted_by_me: payload.user_id === this.currentUserId,
        });
      }
      updated.set(payload.message_id, { ...msg, reaction_groups: groups });
      return updated;
    });
  }

  private handleReactionRemoved(payload: WsReactionRemovedPayload): void {
    this.messageMap.update((map) => {
      const msg = map.get(payload.message_id);
      if (!msg) return map;
      const updated = new Map(map);
      const groups = msg.reaction_groups
        .map((g) => {
          if (g.reaction !== payload.reaction) return g;
          return {
            ...g,
            count: g.count - 1,
            user_ids: g.user_ids.filter((id) => id !== payload.user_id),
            reacted_by_me: g.reacted_by_me && payload.user_id !== this.currentUserId,
          };
        })
        .filter((g) => g.count > 0);
      updated.set(payload.message_id, { ...msg, reaction_groups: groups });
      return updated;
    });
  }

  private setMessages(items: ChatMessage[]): void {
    const map = new Map<string, EnrichedMessage>();
    const ids: string[] = [];
    for (const msg of [...items].reverse()) {
      map.set(msg.id, this.enrich(msg));
      ids.push(msg.id);
    }
    this.messageMap.set(map);
    this.orderedIds.set(ids);
  }

  private prependMessages(items: ChatMessage[]): void {
    this.messageMap.update((map) => {
      const updated = new Map(map);
      for (const msg of items) updated.set(msg.id, this.enrich(msg));
      return updated;
    });
    this.orderedIds.update((ids) => {
      const newIds = [...items].reverse().map((m) => m.id);
      return [...newIds, ...ids];
    });
  }

  private appendMessage(msg: EnrichedMessage): void {
    this.messageMap.update((map) => new Map(map).set(msg.id, msg));
    this.orderedIds.update((ids) => {
      if (ids.includes(msg.id)) return ids;
      return [...ids, msg.id];
    });
  }

  private enrich(msg: ChatMessage): EnrichedMessage {
    return { ...msg, reaction_groups: [] };
  }
}
