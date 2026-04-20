import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonAvatar, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonInput, 
  IonTextarea, 
  IonButtons, 
  IonButton, 
  IonIcon,
  IonSpinner,
  IonNote,
  IonText,
} from '@ionic/angular/standalone';
import { ProfileStore } from '../profile.store';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { cameraOutline, checkmarkOutline, closeOutline } from 'ionicons/icons';
import { ModalController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-profile-edit-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonAvatar,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonButtons,
    IonButton,
    IonIcon,
    IonSpinner,
    IonNote,
    IonText
  ],
  templateUrl: './profile-edit-modal.component.html',
  styleUrls: ['./profile-edit-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileEditModalComponent implements OnInit {
  public profileStore = inject(ProfileStore);
  private modalCtrl = inject(ModalController);

  public editForm = {
    display_name: '',
    username: '',
    bio: '',
    status_text: ''
  };

  constructor() {
    addIcons({ cameraOutline, checkmarkOutline, closeOutline });
  }

  async ngOnInit() {
    if (!this.profileStore.myProfile()) {
      await this.profileStore.loadMyProfile();
    }
    
    const profile = this.profileStore.myProfile();
    if (profile) {
      this.editForm = {
        display_name: profile.display_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        status_text: profile.status_text || ''
      };
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  async save() {
    try {
      await this.profileStore.updateProfile(this.editForm);
      this.modalCtrl.dismiss(true);
    } catch (err) {
      console.error('Update failed', err);
    }
  }

  onAvatarClick() {
    // Placeholder for avatar upload flow in Phase 7
    console.log('Avatar click');
  }
}
