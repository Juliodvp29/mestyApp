import { Injectable, inject, signal, computed } from '@angular/core';
import { StoriesService } from './stories.service';
import { StoryFeedGroup, Story } from './stories.models';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StoriesStore {
  private storiesService = inject(StoriesService);

  private readonly feedSignal = signal<StoryFeedGroup[]>([]);
  private readonly myStoriesSignal = signal<Story[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly feed = computed(() => this.feedSignal());
  readonly myStories = computed(() => this.myStoriesSignal());
  readonly loading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());

  async loadFeed() {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    try {
      const [feed, myStories] = await Promise.all([
        firstValueFrom(this.storiesService.getFeed()),
        firstValueFrom(this.storiesService.getMyStories())
      ]);
      this.feedSignal.set(feed);
      this.myStoriesSignal.set(myStories);
    } catch (err) {
      this.errorSignal.set('Failed to load stories feed');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async createStory(contentUrl: string, contentType: string, caption?: string) {
    this.loadingSignal.set(true);
    try {
      await firstValueFrom(this.storiesService.createStory({
        content_url: contentUrl,
        content_type: contentType,
        caption,
        privacy: 'contacts'
      }));
      await this.loadFeed();
    } catch (err) {
      this.errorSignal.set('Failed to post story');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async markAsViewed(storyId: string) {
    try {
      await firstValueFrom(this.storiesService.viewStory(storyId));
      // Locally update viewed state to avoid full reload
      this.feedSignal.update(feed => feed.map(group => ({
        ...group,
        stories: group.stories.map(s => s.id === storyId ? { ...s, has_viewed: true } : s)
      })));
    } catch (err) {
      console.error('Failed to mark story as viewed', err);
    }
  }
}
