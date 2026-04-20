import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  checkmarkOutline, 
  checkmarkDoneOutline, 
  pencilOutline, 
  trashOutline, 
  banOutline, 
  lockClosedOutline,
  imageOutline,
  videocamOutline,
  musicalNotesOutline,
  documentOutline,
  downloadOutline
} from 'ionicons/icons';
import { EnrichedMessage } from '@features/chats/message-detail.store';
import { MessageTimePipe } from '@shared/pipes/message-time.pipe';
import { MediaLightboxComponent } from '../media-lightbox/media-lightbox.component';
import { AttachmentMeta } from '@features/attachments/attachment.models';

@Component({
  selector: 'app-message-bubble',
  templateUrl: './message-bubble.component.html',
  styleUrls: ['./message-bubble.component.scss'],
  standalone: true,
  imports: [IonIcon, MessageTimePipe, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageBubbleComponent {
  readonly message = input.required<EnrichedMessage>();
  readonly isMine = input.required<boolean>();
  readonly senderName = input<string>('');

  readonly deleted = output<string>();
  readonly reacted = output<{ messageId: string; reaction: string }>();

  private modalCtrl = inject(ModalController);

  constructor() {
    addIcons({ 
      checkmarkOutline, 
      checkmarkDoneOutline, 
      pencilOutline, 
      trashOutline, 
      banOutline, 
      lockClosedOutline,
      imageOutline,
      videocamOutline,
      musicalNotesOutline,
      documentOutline,
      downloadOutline
    });
  }

  get isDeleted(): boolean {
    return this.message().deleted_at !== null;
  }

  get isEdited(): boolean {
    return this.message().edited_at !== null;
  }

  get attachment(): AttachmentMeta | null {
    if (!this.message().metadata) return null;
    try {
      return typeof this.message().metadata === 'string' 
        ? JSON.parse(this.message().metadata as unknown as string) 
        : (this.message().metadata as any);
    } catch {
      return null;
    }
  }

  async openLightbox(): Promise<void> {
    const meta = this.attachment;
    if (!meta) return;

    const modal = await this.modalCtrl.create({
      component: MediaLightboxComponent,
      componentProps: {
        url: meta.file_url,
        fileType: meta.file_type,
        fileName: meta.file_name
      },
      cssClass: 'lightbox-modal'
    });
    await modal.present();
  }

  requestDelete(): void {
    this.deleted.emit(this.message().id);
  }

  react(emoji: string): void {
    this.reacted.emit({ messageId: this.message().id, reaction: emoji });
  }

  getReactedByMe(reaction: string): boolean {
    return this.message().reaction_groups.find((g) => g.reaction === reaction)?.reacted_by_me ?? false;
  }
}
