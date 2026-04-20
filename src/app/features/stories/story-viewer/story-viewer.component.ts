import { ChangeDetectionStrategy, Component, inject, Input, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonContent, 
  IonHeader, 
  IonToolbar, 
  IonButtons, 
  IonButton, 
  IonIcon,
  IonAvatar,
  IonTitle
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { StoriesStore } from '../stories.store';
import { ModalController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-story-viewer',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonAvatar,
    IonTitle
  ],
  templateUrl: './story-viewer.component.html',
  styleUrls: ['./story-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoryViewerComponent implements OnInit, OnDestroy {
  @Input({ required: true }) feedIndex!: number;

  public storiesStore = inject(StoriesStore);
  private modalCtrl = inject(ModalController);

  public storyIndex = signal(0);
  public progress = signal(0);
  private interval: any;

  constructor() {
    addIcons({ closeOutline, chevronBackOutline, chevronForwardOutline });
  }

  get currentGroup() {
    return this.storiesStore.feed()[this.feedIndex];
  }

  get currentStory() {
    return this.currentGroup.stories[this.storyIndex()];
  }

  ngOnInit() {
    this.startProgress();
    this.storiesStore.markAsViewed(this.currentStory.id);
  }

  ngOnDestroy() {
    this.clearProgress();
  }

  startProgress() {
    this.clearProgress();
    this.progress.set(0);
    this.interval = setInterval(() => {
      this.progress.update(p => p + 0.01);
      if (this.progress() >= 1) {
        this.nextStory();
      }
    }, 50); // 5 seconds for each story
  }

  clearProgress() {
    if (this.interval) clearInterval(this.interval);
  }

  nextStory() {
    if (this.storyIndex() < this.currentGroup.stories.length - 1) {
      this.storyIndex.update(i => i + 1);
      this.startProgress();
      this.storiesStore.markAsViewed(this.currentStory.id);
    } else {
      this.dismiss();
    }
  }

  prevStory() {
    if (this.storyIndex() > 0) {
      this.storyIndex.update(i => i - 1);
      this.startProgress();
    } else {
      // Go to previous group or reset
      this.storyIndex.set(0);
      this.startProgress();
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
