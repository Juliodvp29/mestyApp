export interface Story {
  id: string;
  user_id: string;
  content_url: string;
  content_type: string;
  caption?: string;
  privacy: 'public' | 'contacts' | 'selected' | 'private';
  created_at: string;
  expires_at: string;
  has_viewed?: boolean;
}

export interface StoryFeedGroup {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  stories: Story[];
}

export interface CreateStoryRequest {
  content_url: string;
  content_type: string;
  caption?: string;
  privacy: 'public' | 'contacts' | 'selected' | 'private';
  exceptions?: string[];
}
