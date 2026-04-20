import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { 
  IonContent, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonAvatar, 
  IonButtons, 
  IonMenuButton, 
  IonSearchbar,
  IonItemGroup,
  IonItemDivider,
  IonIcon,
  IonButton,
  IonProgressBar,
  IonThumbnail,
  IonRefresher,
  IonRefresherContent
} from '@ionic/angular/standalone';
import { ContactStore } from '../contact.store';
import { addIcons } from 'ionicons';
import { 
  personAddOutline, 
  star, 
  starOutline, 
  searchOutline, 
  ellipsisVerticalOutline 
} from 'ionicons/icons';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonList,
    IonItem,
    IonLabel,
    IonAvatar,
    IonButtons,
    IonMenuButton,
    IonSearchbar,
    IonItemGroup,
    IonItemDivider,
    IonIcon,
    IonButton,
    IonProgressBar,
    IonRefresher,
    IonRefresherContent
  ],
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactListComponent implements OnInit {
  public contactStore = inject(ContactStore);
  
  public searchQuery = signal('');

  public groupedContacts = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const filtered = this.contactStore.contacts().filter(c => 
      c.nickname.toLowerCase().includes(query) || 
      c.phone.includes(query)
    );

    const groups: { [key: string]: any[] } = {};
    filtered.sort((a, b) => a.nickname.localeCompare(b.nickname))
      .forEach(contact => {
        const firstChar = contact.nickname.charAt(0).toUpperCase();
        const key = /^[A-Z]$/.test(firstChar) ? firstChar : '#';
        if (!groups[key]) groups[key] = [];
        groups[key].push(contact);
      });

    return Object.keys(groups).sort((a, b) => {
      if (a === '#') return 1;
      if (b === '#') return -1;
      return a.localeCompare(b);
    }).map(key => ({ key, contacts: groups[key] }));
  });

  constructor() {
    addIcons({ 
      personAddOutline, 
      star, 
      starOutline, 
      searchOutline, 
      ellipsisVerticalOutline 
    });
  }

  ngOnInit() {
    this.contactStore.loadContacts();
  }

  onSearch(event: any) {
    this.searchQuery.set(event.detail.value || '');
  }

  handleRefresh(event: any) {
    this.contactStore.loadContacts().then(() => {
      event.target.complete();
    });
  }

  toggleFavorite(id: string, event: Event) {
    event.stopPropagation();
    this.contactStore.toggleFavorite(id);
  }
}
