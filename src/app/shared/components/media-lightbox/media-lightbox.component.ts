import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { closeOutline, downloadOutline, shareOutline } from 'ionicons/icons';

@Component({
  selector: 'app-media-lightbox',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
  ],
  templateUrl: './media-lightbox.component.html',
  styleUrls: ['./media-lightbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MediaLightboxComponent {
  @Input({ required: true }) url!: string;
  @Input({ required: true }) fileType!: string;
  @Input() fileName?: string;

  private modalCtrl = inject(ModalController);

  constructor() {
    addIcons({ closeOutline, downloadOutline, shareOutline });
  }

  get isImage(): boolean {
    return this.fileType.startsWith('image/');
  }

  get isVideo(): boolean {
    return this.fileType.startsWith('video/');
  }

  get isAudio(): boolean {
    return this.fileType.startsWith('audio/');
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  download() {
    const a = document.createElement('a');
    a.href = this.url;
    a.download = this.fileName || 'download';
    a.target = '_blank';
    a.click();
  }
}
