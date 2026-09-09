import { Injectable } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { BehaviorSubject, Subject } from 'rxjs';
import { environments } from '../../environments/environments';
import { ScannerConnectionState, ScannerEvent } from './scanner.models';

export function scannerWebSocketUrl(apiUrl: string): string {
  const url = new URL(apiUrl, typeof window === 'undefined' ? 'http://localhost' : window.location.origin);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.pathname = '/ws/scanner'; url.search = ''; url.hash = '';
  return url.toString();
}

@Injectable({ providedIn: 'root' })
export class ScannerWebSocketService {
  readonly barcode$ = new Subject<ScannerEvent>();
  readonly connectionState$ = new BehaviorSubject<ScannerConnectionState>('IDLE');
  private client?: Client;
  private subscription?: StompSubscription;
  private reconnectTimer?: ReturnType<typeof setTimeout>;
  private stopped = true;
  private attempts = 0;
  private sessionId = '';
  private jwt = '';
  private readonly delays = [1000, 2000, 4000];

  connect(sessionId: string, jwt: string): void {
    this.disconnect();
    this.sessionId = sessionId; this.jwt = jwt; this.stopped = false; this.attempts = 0;
    this.activate();
  }

  disconnect(): void {
    this.stopped = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = undefined;
    const client = this.client; this.client = undefined;
    const subscription = this.subscription; this.subscription = undefined;
    if (client?.connected && subscription) subscription.unsubscribe();
    if (client?.active) void client.deactivate({ force: !client.connected });
    this.connectionState$.next('DISCONNECTED');
  }

  markExpired(): void { this.disconnect(); this.connectionState$.next('EXPIRED'); }

  private activate(): void {
    if (this.stopped) return;
    this.connectionState$.next('CONNECTING');
    const client: Client = new Client({
      brokerURL: scannerWebSocketUrl(environments.baseURL),
      connectHeaders: { Authorization: `Bearer ${this.jwt}` },
      reconnectDelay: 0,
      debug: () => undefined,
      onConnect: () => {
        if (this.client !== client || this.stopped) { void client.deactivate(); return; }
        this.attempts = 0; this.connectionState$.next('CONNECTED');
        this.subscription = client.subscribe(`/topic/scanner/${this.sessionId}`, (message: IMessage) => this.receive(message));
      },
      onStompError: () => { if (this.client === client) this.connectionState$.next('ERROR'); },
      onWebSocketError: () => { if (this.client === client) this.connectionState$.next('ERROR'); },
      onWebSocketClose: () => this.scheduleReconnect(client),
    });
    this.client = client; client.activate();
  }

  private receive(message: IMessage): void {
    try {
      const event = JSON.parse(message.body) as Partial<ScannerEvent>;
      if (typeof event.barcode !== 'string' || !event.barcode.trim() || event.sessionId !== this.sessionId || typeof event.timestamp !== 'string') return;
      this.barcode$.next({ barcode: event.barcode.trim(), timestamp: event.timestamp, sessionId: event.sessionId });
    } catch { /* Un mensaje inválido se ignora sin interrumpir lecturas posteriores. */ }
  }

  private scheduleReconnect(closedClient: Client): void {
    if (this.stopped || this.client !== closedClient) return;
    if (this.reconnectTimer) return;
    if (this.attempts >= this.delays.length) { this.connectionState$.next('ERROR'); return; }
    const delay = this.delays[this.attempts++];
    this.connectionState$.next('DISCONNECTED');
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = undefined;
      if (this.client === closedClient) this.activate();
    }, delay);
  }
}
