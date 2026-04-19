import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkOutline, checkmarkDoneOutline, pencilOutline, trashOutline, banOutline, lockClosedOutline } from 'ionicons/icons';
import { EnrichedMessage } from '@features/chats/message-detail.store';
import { MessageTimePipe } from '@shared/pipes/message-time.pipe';

@Component({
  selector: 'app-message-bubble',
  templateUrl: './message-bubble.component.html',
  styleUrls: ['./message-bubble.component.scss'],
  standalone: true,
  imports: [IonIcon, MessageTimePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageBubbleComponent {
  readonly message = input.required<EnrichedMessage>();
  readonly isMine = input.required<boolean>();
  readonly senderName = input<string>('');

  readonly deleted = output<string>();
  readonly reacted = output<{ messageId: string; reaction: string }>();

  constructor() {
    addIcons({ checkmarkOutline, checkmarkDoneOutline, pencilOutline, trashOutline, banOutline, lockClosedOutline });
  }

  get isDeleted(): boolean {
    return this.message().deleted_at !== null;
  }

  get isEdited(): boolean {
    return this.message().edited_at !== null;
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
