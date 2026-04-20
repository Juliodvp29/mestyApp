import { ChangeDetectionStrategy, Component, inject, Input, OnInit, signal, computed } from '@angular/core';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonAvatar, 
  IonLabel, 
  IonList, 
  IonItem, 
  IonButtons, 
  IonButton, 
  IonIcon,
  IonText,
  IonNote, IonSpinner } from '@ionic/angular/standalone';
import { ProfileService } from '../../profile/profile.service';
import { UserProfile } from '../../profile/profile.models';
import { ProfileStore } from '../../profile/profile.store';
import { ModalController } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { 
  closeOutline, 
  chatbubbleOutline, 
  banOutline, 
  personAddOutline, 
  warningOutline,
  shareOutline
} from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-user-profile-modal',
  standalone: true,
  imports: [IonSpinner, 
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonAvatar,
    IonLabel,
    IonList,
    IonItem,
    IonButtons,
    IonButton,
    IonIcon,
    IonNote
  ],
  templateUrl: './user-profile-modal.component.html',
  styleUrls: ['./user-profile-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserProfileModalComponent implements OnInit {
  @Input({ required: true }) userId!: string;

  private profileService = inject(ProfileService);
  private profileStore = inject(ProfileStore);
  private modalCtrl = inject(ModalController);

  public user = signal<UserProfile | null>(null);
  public loading = signal(true);

  public isBlocked = computed(() => 
    this.profileStore.blockedUsers().some(b => b.blocked_id === this.userId)
  );

  constructor() {
    addIcons({ 
      closeOutline, 
      chatbubbleOutline, 
      banOutline, 
      personAddOutline, 
      warningOutline,
      shareOutline 
    });
  }

  async ngOnInit() {
    try {
      const profile = await firstValueFrom(this.profileService.getUserProfile(this.userId));
      this.user.set(profile);
    } catch (err) {
      console.error('Failed to load user profile', err);
    } finally {
      this.loading.set(false);
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  async toggleBlock() {
    if (this.isBlocked()) {
      await this.profileStore.unblockUser(this.userId);
    } else {
      await this.profileStore.blockUser(this.userId);
    }
  }

  async startChat() {
    this.modalCtrl.dismiss({ action: 'chat', userId: this.userId });
  }
}
