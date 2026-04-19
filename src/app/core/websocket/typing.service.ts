import { Injectable, signal, computed, inject } from '@angular/core';
import { WebSocketService } from '@core/websocket/websocket.service';
import { WsTypingStartEvent, WsTypingStopEvent } from '@core/websocket/ws.models';

const TYPING_TIMEOUT_MS = 5000;

@Injectable({ providedIn: 'root' })
export class TypingService {
  private readonly wsService = inject(WebSocketService);

  private readonly typingMap = signal<Record<string, Set<string>>>({});
  private readonly timeoutMap = new Map<string, ReturnType<typeof setTimeout>>();

  readonly typingUsers = computed(() => {
    const map = this.typingMap();
    return Object.fromEntries(
      Object.entries(map).map(([chatId, users]) => [chatId, [...users]])
    ) as Record<string, string[]>;
  });

  handleTypingStart(event: WsTypingStartEvent): void {
    const { chat_id, user_id } = event.payload;
    this.addTypingUser(chat_id, user_id);
    this.resetTimeout(chat_id, user_id);
  }

  handleTypingStop(event: WsTypingStopEvent): void {
    const { chat_id, user_id } = event.payload;
    this.removeTypingUser(chat_id, user_id);
    this.clearTimeoutFor(chat_id, user_id);
  }

  sendTypingStart(chatId: string): void {
    this.wsService.send('typing_start', { chat_id: chatId });
  }

  sendTypingStop(chatId: string): void {
    this.wsService.send('typing_stop', { chat_id: chatId });
  }

  isTyping(chatId: string, userId: string): boolean {
    return this.typingMap()[chatId]?.has(userId) ?? false;
  }

  private addTypingUser(chatId: string, userId: string): void {
    this.typingMap.update((map) => {
      const updated = { ...map };
      if (!updated[chatId]) {
        updated[chatId] = new Set();
      }
      updated[chatId] = new Set(updated[chatId]).add(userId);
      return updated;
    });
  }

  private removeTypingUser(chatId: string, userId: string): void {
    this.typingMap.update((map) => {
      if (!map[chatId]) return map;
      const updated = { ...map };
      const users = new Set(updated[chatId]);
      users.delete(userId);
      if (users.size === 0) {
        delete updated[chatId];
      } else {
        updated[chatId] = users;
      }
      return updated;
    });
  }

  private resetTimeout(chatId: string, userId: string): void {
    const key = `${chatId}:${userId}`;
    this.clearTimeoutFor(chatId, userId);
    const timer = setTimeout(() => {
      this.removeTypingUser(chatId, userId);
      this.timeoutMap.delete(key);
    }, TYPING_TIMEOUT_MS);
    this.timeoutMap.set(key, timer);
  }

  private clearTimeoutFor(chatId: string, userId: string): void {
    const key = `${chatId}:${userId}`;
    const existing = this.timeoutMap.get(key);
    if (existing) {
      clearTimeout(existing);
      this.timeoutMap.delete(key);
    }
  }
}
