export interface Contact {
  id: string;               // contact record uuid
  contact_id: string | null; // target user uuid if registered
  phone: string;
  nickname: string;
  is_favorite: boolean;
  created_at: string;
}

export interface ContactSyncMatch {
  hash: string;
  user_id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
}

export interface ContactSyncResponse {
  matches: ContactSyncMatch[];
}

export interface CreateContactRequest {
  phone: string;
  nickname: string;
}

export interface UpdateContactRequest {
  nickname?: string;
  is_favorite?: boolean;
}
