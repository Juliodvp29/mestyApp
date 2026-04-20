import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEventType, HttpRequest, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, filter, map } from 'rxjs';
import { environment } from '@env/environment';
import {
  UploadUrlRequest,
  UploadUrlResponse,
  ConfirmAttachmentRequest,
} from './attachment.models';

@Injectable({ providedIn: 'root' })
export class AttachmentService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/attachments`;

  requestUploadUrl(payload: UploadUrlRequest): Observable<UploadUrlResponse> {
    return this.http.post<UploadUrlResponse>(`${this.baseUrl}/upload-url`, payload);
  }

  uploadToS3(uploadUrl: string, file: File): Observable<number> {
    const req = new HttpRequest('PUT', uploadUrl, file, {
      headers: new HttpHeaders({ 'Content-Type': file.type }),
      reportProgress: true,
    });

    return this.http.request(req).pipe(
      filter(event => event.type === HttpEventType.UploadProgress || event instanceof HttpResponse),
      map(event => {
        if (event.type === HttpEventType.UploadProgress) {
          const percent = event.total ? Math.round((100 * event.loaded) / event.total) : 0;
          return percent;
        }
        return 100;
      })
    );
  }

  confirmAttachment(payload: ConfirmAttachmentRequest): Observable<object> {
    return this.http.post<object>(`${this.baseUrl}/confirm`, payload);
  }
}
