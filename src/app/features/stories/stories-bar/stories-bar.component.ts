import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonAvatar, 
  IonIcon, 
  IonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline } from 'ionicons/icons';
import { StoriesStore } from '../stories.store';
import { ModalController } from '@ionic/angular/standalone';
import { StoryViewerComponent } from '../story-viewer/story-viewer.component';

@Component({
  selector: 'app-stories-bar',
  standalone: true,
  imports: [
    CommonModule, 
    IonAvatar, 
    IonIcon, 
    IonText
  ],
  templateUrl: './stories-bar.component.html',
  styleUrls: ['./stories-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoriesBarComponent implements OnInit {
  public storiesStore = inject(StoriesStore);
  private modalCtrl = inject(ModalController);

  constructor() {
    addIcons({ addOutline });
  }

  ngOnInit() {
    this.storiesStore.loadFeed();
  }

  async openStory(index: number) {
    const modal = await this.modalCtrl.create({
      component: StoryViewerComponent,
      componentProps: {
        feedIndex: index
      },
      cssClass: 'story-viewer-modal'
    });
    await modal.present();
  }

  onAddStory() {
    // This would trigger the upload flow
    console.log('Add story');
  }
}
