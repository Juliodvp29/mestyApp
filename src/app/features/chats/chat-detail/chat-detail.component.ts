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
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
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
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { sendOutline, attachOutline, arrowUpOutline, chatbubbleEllipsesOutline } from 'ionicons/icons';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/auth/auth.service';
import { ChatStore } from '@features/chats/chat.store';
import { PresenceService } from '@core/websocket/presence.service';
import { TypingService } from '@core/websocket/typing.service';
import { MessageDetailStore } from '@features/chats/message-detail.store';
import { MessageDateLabelPipe } from '@shared/pipes/message-date-label.pipe';
import { MessageBubbleComponent } from '@shared/components/message-bubble/message-bubble.component';

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
    FormsModule,
    MessageBubbleComponent,
    MessageDateLabelPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatDetailComponent implements OnInit, OnDestroy {
  @ViewChild('messagesEnd') messagesEnd!: ElementRef;

  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly authService: AuthService = inject(AuthService);
  private readonly chatStore: ChatStore = inject(ChatStore);
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

  private typingTimer: ReturnType<typeof setTimeout> | null = null;
  private isTypingActive = false;

  constructor() {
    addIcons({ sendOutline, attachOutline, arrowUpOutline, chatbubbleEllipsesOutline });

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
