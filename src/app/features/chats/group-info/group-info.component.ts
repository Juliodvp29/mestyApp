import { ChangeDetectionStrategy, Component, inject, Input, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonAvatar, 
  IonButtons, 
  IonBackButton, 
  IonButton, 
  IonIcon,
  IonBadge,
  IonNote,
  IonToggle
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  personAddOutline, 
  shieldCheckmarkOutline, 
  exitOutline, 
  linkOutline,
  trashOutline,
  chevronForwardOutline,
  ellipsisVerticalOutline
} from 'ionicons/icons';
import { ChatStore } from '../chat.store';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { firstValueFrom } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

interface Participant {
  user_id: string;
  chat_id: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
  display_name?: string;
  username?: string;
  avatar_url?: string;
  joined_at: string;
}

@Component({
  selector: 'app-group-info',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonAvatar,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonBadge,
    IonNote,
    IonToggle
  ],
  templateUrl: './group-info.component.html',
  styleUrls: ['./group-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupInfoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  public chatStore = inject(ChatStore);

  readonly chatId = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('id') ?? '')),
    { initialValue: '' }
  );

  public participants = signal<Participant[]>([]);
  public loading = signal(true);
  public inviteLink = signal<string | null>(null);

  readonly chat = computed(() => this.chatStore.getChatById(this.chatId()));

  constructor() {
    addIcons({ 
      personAddOutline, 
      shieldCheckmarkOutline, 
      exitOutline, 
      linkOutline,
      trashOutline,
      chevronForwardOutline,
      ellipsisVerticalOutline
    });
  }

  async ngOnInit() {
    await this.loadParticipants();
  }

  async loadParticipants() {
    this.loading.set(true);
    try {
      const response = await firstValueFrom(
        this.http.get<{ participants: Participant[] }>(
          `${environment.apiUrl}/chats/${this.chatId()}/participants`
        )
      );
      this.participants.set(response.participants);
    } catch (err) {
      console.error('Failed to load participants', err);
    } finally {
      this.loading.set(false);
    }
  }

  async createInviteLink() {
    try {
      const response = await firstValueFrom(
        this.http.post<{ invite_link: string }>(
          `${environment.apiUrl}/chats/${this.chatId()}/invite-link`, 
          {}
        )
      );
      this.inviteLink.set(response.invite_link);
    } catch (err) {
      console.error('Failed to create invite link', err);
    }
  }

  async changeRole(userId: string, newRole: string) {
    try {
      await firstValueFrom(
        this.http.patch(
          `${environment.apiUrl}/chats/${this.chatId()}/participants/${userId}/role`,
          { role: newRole }
        )
      );
      await this.loadParticipants();
    } catch (err) {
      console.error('Failed to change role', err);
    }
  }

  async removeParticipant(userId: string) {
    try {
      await firstValueFrom(
        this.http.delete(
          `${environment.apiUrl}/chats/${this.chatId()}/participants/${userId}`
        )
      );
      await this.loadParticipants();
    } catch (err) {
      console.error('Failed to remove participant', err);
    }
  }
}
