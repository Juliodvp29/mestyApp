import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  Contact,
  ContactSyncResponse,
  CreateContactRequest,
  UpdateContactRequest,
} from './contacts.models';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/contacts`;

  getContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>(this.baseUrl);
  }

  createContact(payload: CreateContactRequest): Observable<Contact> {
    return this.http.post<Contact>(this.baseUrl, payload);
  }

  updateContact(id: string, payload: UpdateContactRequest): Observable<Contact> {
    return this.http.patch<Contact>(`${this.baseUrl}/${id}`, payload);
  }

  deleteContact(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  syncContacts(hashes: string[]): Observable<ContactSyncResponse> {
    return this.http.post<ContactSyncResponse>(`${this.baseUrl}/sync`, { hashes });
  }
}
