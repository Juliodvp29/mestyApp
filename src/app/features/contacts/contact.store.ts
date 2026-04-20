import { Injectable, inject, signal, computed } from '@angular/core';
import { ContactService } from './contact.service';
import { Contact, CreateContactRequest } from './contacts.models';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ContactStore {
  private contactService = inject(ContactService);

  // State
  private _contacts = signal<Contact[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  // Selectors
  readonly contacts = computed(() => this._contacts());
  readonly loading = computed(() => this._loading());
  readonly error = computed(() => this._error());

  readonly favoriteContacts = computed(() => 
    this._contacts().filter(c => c.is_favorite)
  );

  async loadContacts(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const contacts = await firstValueFrom(this.contactService.getContacts());
      this._contacts.set(contacts);
    } catch (err: any) {
      this._error.set(err.error?.message || 'Failed to load contacts');
    } finally {
      this._loading.set(false);
    }
  }

  async addContact(payload: CreateContactRequest): Promise<void> {
    this._loading.set(true);
    try {
      const newContact = await firstValueFrom(this.contactService.createContact(payload));
      this._contacts.update(contacts => [...contacts, newContact]);
    } catch (err: any) {
      this._error.set(err.error?.message || 'Failed to add contact');
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  async deleteContact(id: string): Promise<void> {
    try {
      await firstValueFrom(this.contactService.deleteContact(id));
      this._contacts.update(contacts => contacts.filter(c => c.id !== id));
    } catch (err: any) {
      this._error.set(err.error?.message || 'Failed to delete contact');
      throw err;
    }
  }

  async toggleFavorite(id: string): Promise<void> {
    const contact = this._contacts().find(c => c.id === id);
    if (!contact) return;

    try {
      const updated = await firstValueFrom(
        this.contactService.updateContact(id, { is_favorite: !contact.is_favorite })
      );
      this._contacts.update(contacts => 
        contacts.map(c => c.id === id ? updated : c)
      );
    } catch (err: any) {
      this._error.set(err.error?.message || 'Failed to update contact');
    }
  }
}
