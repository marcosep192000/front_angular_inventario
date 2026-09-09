export interface ScannerSession {
  sessionId: string;
  token: string;
  scannerUrl: string;
  expiresAt: string;
}

export interface ScannerEvent {
  barcode: string;
  timestamp: string;
  sessionId: string;
}

export type ScannerConnectionState = 'IDLE' | 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'EXPIRED';

export const SCANNER_TERMINAL_ID = 'CAJA-1';
