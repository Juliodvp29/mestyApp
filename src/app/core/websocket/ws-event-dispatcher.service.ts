import { Injectable, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WebSocketService } from '@core/websocket/websocket.service';
import { ChatStore } from '@features/chats/chat.store';
import { TypingService } from '@core/websocket/typing.service';
import { PresenceService } from '@core/websocket/presence.service';
import { WsServerEvent } from '@core/websocket/ws.models';

@Injectable({ providedIn: 'root' })
export class WsEventDispatcherService {
  private readonly wsService = inject(WebSocketService);
  private readonly chatStore = inject(ChatStore);
  private readonly typingService = inject(TypingService);
  private readonly presenceService = inject(PresenceService);
  private readonly destroyRef = inject(DestroyRef);

  initialize(): void {
    this.wsService.events$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => this.dispatch(event));
  }

  private dispatch(event: WsServerEvent): void {
    switch (event.type) {
      case 'new_message':
        this.chatStore.handleNewMessage(event.payload);
        break;

      case 'message_edited':
        this.chatStore.handleMessageEdited(event.payload);
        break;

      case 'message_deleted':
        this.chatStore.handleMessageDeleted(event.payload);
        break;

      case 'reaction_added':
        this.chatStore.handleReactionAdded(event.payload);
        break;

      case 'reaction_removed':
        this.chatStore.handleReactionRemoved(event.payload);
        break;

      case 'messages_read':
        this.chatStore.handleMessagesRead(event.payload);
        break;

      case 'typing_start':
        this.typingService.handleTypingStart(event);
        break;

      case 'typing_stop':
        this.typingService.handleTypingStop(event);
        break;

      case 'user_online':
        this.presenceService.markOnline(event.payload.user_id);
        break;

      case 'user_offline':
        this.presenceService.markOffline(event.payload.user_id);
        break;

      case 'key_changed':
        break;
    }
  }
}
