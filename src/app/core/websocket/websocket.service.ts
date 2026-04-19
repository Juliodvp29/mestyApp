import { Injectable, signal, inject, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { environment } from '@env/environment';
import { AuthService } from '@core/auth/auth.service';
import { WsServerEvent, WsConnectionStatus } from '@core/websocket/ws.models';

const INITIAL_RECONNECT_DELAY_MS = 1000;
const MAX_RECONNECT_DELAY_MS = 30000;
const JITTER_FACTOR = 0.3;

@Injectable({ providedIn: 'root' })
export class WebSocketService implements OnDestroy {
  private authService = inject(AuthService);

  private socket: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private lastEventTimestamp: string | null = null;
  private outgoingQueue: string[] = [];
  private isDestroyed = false;

  private readonly eventsSubject = new Subject<WsServerEvent>();
  readonly events$: Observable<WsServerEvent> = this.eventsSubject.asObservable();

  readonly connectionStatus = signal<WsConnectionStatus>('disconnected');

  connect(): void {
    if (this.isDestroyed) return;
    if (this.socket && this.socket.readyState === WebSocket.OPEN) return;

    const token = this.authService.getAccessToken();
    if (!token) return;

    this.clearReconnectTimer();
    this.connectionStatus.set('connecting');

    const url = `${environment.wsUrl}?token=${encodeURIComponent(token)}`;
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      this.connectionStatus.set('connected');
      this.reconnectAttempts = 0;
      this.flushOutgoingQueue();
      this.sendSyncRequest();
    };

    this.socket.onmessage = (event: MessageEvent) => {
      this.handleIncomingMessage(event.data);
    };

    this.socket.onerror = () => {
      this.connectionStatus.set('disconnected');
    };

    this.socket.onclose = () => {
      this.connectionStatus.set('disconnected');
      this.socket = null;
      if (!this.isDestroyed && this.authService.isAuthenticated()) {
        this.scheduleReconnect();
      }
    };
  }

  disconnect(): void {
    this.clearReconnectTimer();
    if (this.socket) {
      this.socket.onclose = null;
      this.socket.close();
      this.socket = null;
    }
    this.connectionStatus.set('disconnected');
    this.reconnectAttempts = 0;
  }

  send(type: string, payload: unknown): void {
    const message = JSON.stringify({ type, payload });
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    } else {
      this.outgoingQueue.push(message);
    }
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.disconnect();
    this.eventsSubject.complete();
  }

  private handleIncomingMessage(raw: string): void {
    try {
      const event = JSON.parse(raw) as WsServerEvent;
      this.lastEventTimestamp = new Date().toISOString();
      this.eventsSubject.next(event);
    } catch {
      // Ignore malformed messages
    }
  }

  private scheduleReconnect(): void {
    const baseDelay = Math.min(
      INITIAL_RECONNECT_DELAY_MS * Math.pow(2, this.reconnectAttempts),
      MAX_RECONNECT_DELAY_MS
    );
    const jitter = baseDelay * JITTER_FACTOR * (Math.random() * 2 - 1);
    const delay = Math.round(baseDelay + jitter);

    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private flushOutgoingQueue(): void {
    while (this.outgoingQueue.length > 0) {
      const message = this.outgoingQueue.shift();
      if (message && this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(message);
      }
    }
  }

  private sendSyncRequest(): void {
    if (this.lastEventTimestamp) {
      this.send('sync_request', { since: this.lastEventTimestamp });
    }
  }
}
