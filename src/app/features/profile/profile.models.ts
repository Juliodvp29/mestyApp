export interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  status_text: string | null;
}

export interface UpdateProfileRequest {
  username?: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  status_text?: string;
}

export interface UserSearchResponse {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
}

export interface BlockRecord {
  id: string;
  blocked_id: string;
  created_at: string;
}

export interface BlockListResponse {
  blocks: BlockRecord[];
}
