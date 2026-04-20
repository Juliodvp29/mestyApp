import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonSearchbar, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonAvatar, 
  IonButtons, 
  IonButton,
  IonProgressBar,
  IonIcon
} from '@ionic/angular/standalone';
import { ProfileService } from '../../profile/profile.service';
import { UserSearchResponse } from '../../profile/profile.models';
import { ModalController } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { closeOutline, personAddOutline, chatbubbleOutline } from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-user-search-modal',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSearchbar,
    IonList,
    IonItem,
    IonLabel,
    IonAvatar,
    IonButtons,
    IonButton,
    IonProgressBar,
    IonIcon
  ],
  templateUrl: './user-search-modal.component.html',
  styleUrls: ['./user-search-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserSearchModalComponent {
  private profileService = inject(ProfileService);
  private modalCtrl = inject(ModalController);

  public results = signal<UserSearchResponse[]>([]);
  public loading = signal(false);
  public query = signal('');

  constructor() {
    addIcons({ closeOutline, personAddOutline, chatbubbleOutline });
  }

  async onSearch(event: any) {
    const q = event.detail.value || '';
    this.query.set(q);

    if (q.length < 2) {
      this.results.set([]);
      return;
    }

    this.loading.set(true);
    try {
      const searchResults = await firstValueFrom(this.profileService.searchUsers(q));
      this.results.set(searchResults);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      this.loading.set(false);
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  selectUser(user: UserSearchResponse) {
    this.modalCtrl.dismiss(user);
  }
}
