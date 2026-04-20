export interface UploadUrlRequest {
  file_type: string;
  file_size: number;
  chat_id?: string;
  file_name?: string;
}

export interface UploadUrlResponse {
  upload_url: string;
  file_url: string;
  attachment_id: string;
  expires_at: string;
}

export interface ConfirmAttachmentRequest {
  attachment_id: string;
  message_id: string;
  encryption_key_enc?: string;
  encryption_iv?: string;
}

export interface AttachmentMeta {
  attachment_id: string;
  file_url: string;
  file_type: string;
  file_name?: string;
  file_size?: number;
}

export interface UploadProgressState {
  state: 'idle' | 'requesting' | 'uploading' | 'confirming' | 'done' | 'error';
  progress: number;
  error: string | null;
  result: UploadUrlResponse | null;
}
