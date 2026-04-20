import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { 
  Story, 
  StoryFeedGroup, 
  CreateStoryRequest 
} from './stories.models';

@Injectable({ providedIn: 'root' })
export class StoriesService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/stories`;

  getFeed(): Observable<StoryFeedGroup[]> {
    return this.http.get<StoryFeedGroup[]>(this.baseUrl);
  }

  getMyStories(): Observable<Story[]> {
    return this.http.get<Story[]>(`${this.baseUrl}/me`);
  }

  createStory(request: CreateStoryRequest): Observable<{ id: string; expires_at: string }> {
    return this.http.post<{ id: string; expires_at: string }>(this.baseUrl, request);
  }

  deleteStory(storyId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${storyId}`);
  }

  viewStory(storyId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${storyId}/view`, {});
  }
}
