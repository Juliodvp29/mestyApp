export interface ChatPreview {
  chat_id: string;
  chat_type: 'private' | 'group';
  name: string | null;
  avatar_url: string | null;
  last_message_id: string | null;
  last_message_encrypted: string | null;
  last_sender_id: string | null;
  last_message_at: string | null;
  is_pinned: boolean;
  pin_order: number;
  is_muted: boolean;
  is_archived: boolean;
  unread_count: number;
}

export interface ChatDetail {
  id: string;
  chat_type: 'private' | 'group';
  name: string | null;
  avatar_url: string | null;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string | null;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  reply_to_id: string | null;
  content_encrypted: string | null;
  content_iv: string | null;
  message_type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'system';
  metadata: Record<string, unknown> | null;
  is_forwarded: boolean;
  created_at: string;
  edited_at: string | null;
  deleted_at: string | null;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  reaction: string;
  created_at: string;
}

export interface ParticipantDetail {
  user_id: string;
  chat_id: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
  encryption_key_enc: string | null;
  added_by: string | null;
  joined_at: string;
}

export interface ChatListResponse {
  items: ChatPreview[];
  next_cursor: string | null;
  has_more: boolean;
}

export interface MessageListResponse {
  items: ChatMessage[];
  next_cursor: string | null;
  has_more: boolean;
}

export interface SendMessageRequest {
  content_encrypted?: string;
  content_iv?: string;
  message_type: 'text' | 'image' | 'video' | 'audio' | 'file';
  reply_to_id?: string;
  is_forwarded: boolean;
  metadata?: Record<string, unknown>;
}

export interface CreatePrivateChatRequest {
  type: 'private';
  participant_id: string;
}

export interface CreateGroupChatRequest {
  type: 'group';
  name: string;
  participant_ids: string[];
}

export type CreateChatRequest = CreatePrivateChatRequest | CreateGroupChatRequest;
