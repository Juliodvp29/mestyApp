export type WsConnectionStatus = 'connected' | 'connecting' | 'disconnected';

export interface WsEnvelope<T = unknown> {
  type: string;
  payload: T;
}

export interface TypingStartPayload {
  chat_id: string;
}

export interface TypingStopPayload {
  chat_id: string;
}

export interface SyncRequestPayload {
  since: string;
}

export interface WsTypingStartEvent {
  type: 'typing_start';
  payload: { chat_id: string; user_id: string };
}

export interface WsTypingStopEvent {
  type: 'typing_stop';
  payload: { chat_id: string; user_id: string };
}

export interface WsNewMessagePayload {
  chat_id: string;
  message: {
    id: string;
    sender_id: string;
    content_encrypted: string;
    content_iv: string;
    message_type: string;
    created_at: string;
  };
}

export interface WsNewMessageEvent {
  type: 'new_message';
  payload: WsNewMessagePayload;
}

export interface WsMessageEditedPayload {
  chat_id: string;
  message_id: string;
  content_encrypted: string;
  content_iv: string;
  edited_at: string;
}

export interface WsMessageEditedEvent {
  type: 'message_edited';
  payload: WsMessageEditedPayload;
}

export interface WsMessageDeletedPayload {
  chat_id: string;
  message_id: string;
}

export interface WsMessageDeletedEvent {
  type: 'message_deleted';
  payload: WsMessageDeletedPayload;
}

export interface WsReactionAddedPayload {
  chat_id: string;
  message_id: string;
  user_id: string;
  reaction: string;
}

export interface WsReactionAddedEvent {
  type: 'reaction_added';
  payload: WsReactionAddedPayload;
}

export interface WsReactionRemovedPayload {
  chat_id: string;
  message_id: string;
  user_id: string;
  reaction: string;
}

export interface WsReactionRemovedEvent {
  type: 'reaction_removed';
  payload: WsReactionRemovedPayload;
}

export interface WsMessagesReadPayload {
  chat_id: string;
  user_id: string;
  up_to: string;
}

export interface WsMessagesReadEvent {
  type: 'messages_read';
  payload: WsMessagesReadPayload;
}

export interface WsUserOnlinePayload {
  user_id: string;
}

export interface WsUserOnlineEvent {
  type: 'user_online';
  payload: WsUserOnlinePayload;
}

export interface WsUserOfflinePayload {
  user_id: string;
}

export interface WsUserOfflineEvent {
  type: 'user_offline';
  payload: WsUserOfflinePayload;
}

export interface WsKeyChangedPayload {
  user_id: string;
  timestamp: string;
}

export interface WsKeyChangedEvent {
  type: 'key_changed';
  payload: WsKeyChangedPayload;
}

export type WsServerEvent =
  | WsNewMessageEvent
  | WsMessageEditedEvent
  | WsMessageDeletedEvent
  | WsReactionAddedEvent
  | WsReactionRemovedEvent
  | WsMessagesReadEvent
  | WsUserOnlineEvent
  | WsUserOfflineEvent
  | WsTypingStartEvent
  | WsTypingStopEvent
  | WsKeyChangedEvent;
