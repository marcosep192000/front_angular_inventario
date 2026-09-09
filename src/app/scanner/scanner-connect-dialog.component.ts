import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import * as QRCode from 'qrcode';
import { ScannerConnectionState, ScannerSession } from './scanner.models';
import { ScannerWebSocketService } from './scanner-websocket.service';

@Component({
  selector: 'app-scanner-connect-dialog', standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './scanner-connect-dialog.component.html', styleUrl: './scanner-connect-dialog.component.css',
})
export class ScannerConnectDialogComponent implements OnInit, OnDestroy {
  qrDataUrl = '';
  state: ScannerConnectionState = 'CONNECTING';
  lastBarcode = '';
  private feedbackTimer?: ReturnType<typeof setTimeout>;
  private readonly subscriptions = new Subscription();

  constructor(@Inject(MAT_DIALOG_DATA) readonly session: ScannerSession, private readonly websocket: ScannerWebSocketService,
    private readonly ref: MatDialogRef<ScannerConnectDialogComponent, 'finish' | 'regenerate'>) {}

  ngOnInit(): void {
    void QRCode.toDataURL(this.session.scannerUrl, { width: 240, margin: 2, errorCorrectionLevel: 'M' }).then(value => this.qrDataUrl = value);
    this.subscriptions.add(this.websocket.connectionState$.subscribe(state => this.state = state));
    this.subscriptions.add(this.websocket.barcode$.subscribe(event => {
      this.lastBarcode = event.barcode;
      if (this.feedbackTimer) clearTimeout(this.feedbackTimer);
      this.feedbackTimer = setTimeout(() => this.lastBarcode = '', 1400);
    }));
  }

  get statusText(): string {
    return ({ IDLE:'Esperando lector', CONNECTING:'Conectando…', CONNECTED:'Lector listo', DISCONNECTED:'Conexión perdida',
      ERROR:'Error de conexión', EXPIRED:'La sesión del lector venció. Generá un nuevo QR.' } as Record<ScannerConnectionState,string>)[this.state];
  }
  finish(): void { this.ref.close('finish'); }
  regenerate(): void { this.ref.close('regenerate'); }
  ngOnDestroy(): void { this.subscriptions.unsubscribe(); if (this.feedbackTimer) clearTimeout(this.feedbackTimer); }
}
