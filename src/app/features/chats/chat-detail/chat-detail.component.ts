import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
  effect,
  ViewChild,
  ElementRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, firstValueFrom } from 'rxjs';
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonFooter,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonAvatar,
  IonSpinner,
  IonTextarea,
  IonProgressBar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { sendOutline, attachOutline, arrowUpOutline, chatbubbleEllipsesOutline, imageOutline, documentOutline } from 'ionicons/icons';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/auth/auth.service';
import { ChatStore } from '@features/chats/chat.store';
import { PresenceService } from '@core/websocket/presence.service';
import { TypingService } from '@core/websocket/typing.service';
import { MessageDetailStore } from '@features/chats/message-detail.store';
import { MessageDateLabelPipe } from '@shared/pipes/message-date-label.pipe';
import { MessageBubbleComponent } from '@shared/components/message-bubble/message-bubble.component';
import { AttachmentService } from '@features/attachments/attachment.service';
import { UploadProgressState } from '@features/attachments/attachment.models';

@Component({
  selector: 'app-chat-detail',
  templateUrl: './chat-detail.component.html',
  styleUrls: ['./chat-detail.component.scss'],
  standalone: true,
  providers: [MessageDetailStore],
  imports: [
    IonHeader,
    IonToolbar,
    IonContent,
    IonFooter,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonAvatar,
    IonSpinner,
    IonTextarea,
    IonProgressBar,
    FormsModule,
    RouterLink,
    MessageBubbleComponent,
    MessageDateLabelPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatDetailComponent implements OnInit, OnDestroy {
  @ViewChild('messagesEnd') messagesEnd!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly authService: AuthService = inject(AuthService);
  private readonly chatStore: ChatStore = inject(ChatStore);
  private readonly attachmentService: AttachmentService = inject(AttachmentService);
  readonly presenceService: PresenceService = inject(PresenceService);
  readonly typingService: TypingService = inject(TypingService);
  readonly store: MessageDetailStore = inject(MessageDetailStore);

  readonly chatId = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('id') ?? '')),
    { initialValue: '' }
  );

  readonly currentUserId = computed(() => this.authService.user()?.id ?? '');

  readonly chat = computed(() =>
    this.chatStore.getChatById(this.chatId())
  );

  readonly chatName = computed(() => this.chat()?.name ?? 'Direct Message');

  readonly typingText = computed(() => {
    const users = this.typingService.typingUsers()[this.chatId()];
    if (!users || users.length === 0) return '';
    return users.length === 1 ? 'typing…' : `${users.length} people typing…`;
  });

  readonly messageText = signal('');
  readonly isSending = signal(false);

  readonly uploadState = signal<UploadProgressState>({
    state: 'idle',
    progress: 0,
    error: null,
    result: null,
  });

  readonly isUploading = computed(() =>
    ['requesting', 'uploading', 'confirming'].includes(this.uploadState().state)
  );

  private typingTimer: ReturnType<typeof setTimeout> | null = null;
  private isTypingActive = false;

  constructor() {
    addIcons({ sendOutline, attachOutline, arrowUpOutline, chatbubbleEllipsesOutline, imageOutline, documentOutline });

    effect(() => {
      const messages = this.store.messages();
      if (messages.length > 0) {
        requestAnimationFrame(() => this.scrollToBottom());
      }
    });
  }

  ngOnInit(): void {
    const id = this.chatId();
    if (id) {
      this.store.initialize(id, this.currentUserId());
    }
  }

  ngOnDestroy(): void {
    this.stopTyping();
  }

  getInitial(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  showDateSeparator(index: number): boolean {
    const messages = this.store.messages();
    if (index === 0) return true;
    const current = new Date(messages[index].created_at).toDateString();
    const previous = new Date(messages[index - 1].created_at).toDateString();
    return current !== previous;
  }

  onTextInput(): void {
    if (!this.isTypingActive) {
      this.isTypingActive = true;
      this.typingService.sendTypingStart(this.chatId());
    }
    if (this.typingTimer) clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => this.stopTyping(), 3000);
  }

  private stopTyping(): void {
    if (this.isTypingActive) {
      this.isTypingActive = false;
      this.typingService.sendTypingStop(this.chatId());
    }
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
      this.typingTimer = null;
    }
  }

  async onSend(): Promise<void> {
    const text = this.messageText().trim();
    if (!text || this.isSending()) return;
    this.stopTyping();
    this.isSending.set(true);
    this.messageText.set('');
    try {
      await this.store.sendMessage(
        btoa(text),
        btoa('placeholder-iv')
      );
    } finally {
      this.isSending.set(false);
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSend();
    }
  }

  triggerFilePicker(): void {
    this.fileInput?.nativeElement?.click();
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    input.value = '';

    this.uploadState.set({ state: 'requesting', progress: 0, error: null, result: null });

    try {
      const urlResponse = await firstValueFrom(
        this.attachmentService.requestUploadUrl({
          file_type: file.type,
          file_size: file.size,
          chat_id: this.chatId(),
          file_name: file.name,
        })
      );

      this.uploadState.update(s => ({ ...s, state: 'uploading', result: urlResponse }));

      await new Promise<void>((resolve, reject) => {
        this.attachmentService.uploadToS3(urlResponse.upload_url, file).subscribe({
          next: (progress) => {
            this.uploadState.update(s => ({ ...s, progress }));
          },
          error: reject,
          complete: resolve,
        });
      });

      this.uploadState.update(s => ({ ...s, state: 'confirming', progress: 100 }));

      const attachmentMeta = JSON.stringify({
        attachment_id: urlResponse.attachment_id,
        file_url: urlResponse.file_url,
        file_type: file.type,
        file_name: file.name,
        file_size: file.size,
      });

      const msgId = await this.store.sendMessage(
        btoa(`[attachment]`),
        btoa('placeholder-iv'),
        'file',
        attachmentMeta
      );

      if (msgId) {
        await firstValueFrom(
          this.attachmentService.confirmAttachment({
            attachment_id: urlResponse.attachment_id,
            message_id: msgId,
          })
        );
      }

      this.uploadState.set({ state: 'done', progress: 100, error: null, result: urlResponse });
      setTimeout(() => this.uploadState.set({ state: 'idle', progress: 0, error: null, result: null }), 2000);

    } catch (err: any) {
      this.uploadState.set({
        state: 'error',
        progress: 0,
        error: 'Failed to upload file. Please try again.',
        result: null,
      });
    }
  }

  async onDeleteMessage(messageId: string): Promise<void> {
    await this.store.deleteMessage(messageId);
  }

  onReact(event: { messageId: string; reaction: string }): void {
    this.store.addReaction(event.messageId, event.reaction);
  }

  private scrollToBottom(): void {
    this.messagesEnd?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
  }
}
