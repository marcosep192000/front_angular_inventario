import { fakeAsync, tick } from '@angular/core/testing';
import { ScannerWebSocketService, scannerWebSocketUrl } from './scanner-websocket.service';

describe('ScannerWebSocketService', () => {
  it('convierte HTTP y HTTPS al endpoint STOMP sin conservar /api/v1', () => {
    expect(scannerWebSocketUrl('http://192.168.1.20:8080/api/v1/')).toBe('ws://192.168.1.20:8080/ws/scanner');
    expect(scannerWebSocketUrl('https://inventario.local/api/v1/')).toBe('wss://inventario.local/ws/scanner');
  });

  it('emite sólo eventos válidos de la sesión conectada', () => {
    const service = new ScannerWebSocketService() as any;
    service.sessionId = 'session-1';
    const received: any[] = [];
    service.barcode$.subscribe((event: any) => received.push(event));
    service.receive({ body: JSON.stringify({ barcode:' 7791234567890 ', timestamp:'2026-09-08T12:01:20Z', sessionId:'session-1' }) });
    service.receive({ body: JSON.stringify({ barcode:'otro', timestamp:'fecha', sessionId:'otra-session' }) });
    service.receive({ body: 'mensaje inválido' });
    expect(received).toEqual([{ barcode:'7791234567890', timestamp:'2026-09-08T12:01:20Z', sessionId:'session-1' }]);
  });

  it('no agenda reconexión después de disconnect', fakeAsync(() => {
    const service = new ScannerWebSocketService() as any;
    service.stopped = true;
    spyOn(service, 'activate');
    service.scheduleReconnect(); tick(5000);
    expect(service.activate).not.toHaveBeenCalled();
  }));

  it('cleanup es idempotente y no envía unsubscribe sobre un socket cerrado', () => {
    const service = new ScannerWebSocketService() as any;
    const subscription = jasmine.createSpyObj('subscription', ['unsubscribe']);
    const client = { connected:false, active:true, deactivate:jasmine.createSpy('deactivate').and.returnValue(Promise.resolve()) };
    service.subscription = subscription; service.client = client; service.stopped = false;

    service.disconnect(); service.disconnect();

    expect(subscription.unsubscribe).not.toHaveBeenCalled();
    expect(client.deactivate).toHaveBeenCalledOnceWith({ force:true });
  });

  it('cleanup desuscribe una sola vez cuando STOMP sigue conectado', () => {
    const service = new ScannerWebSocketService() as any;
    const subscription = jasmine.createSpyObj('subscription', ['unsubscribe']);
    const client = { connected:true, active:true, deactivate:jasmine.createSpy('deactivate').and.returnValue(Promise.resolve()) };
    service.subscription = subscription; service.client = client;

    service.disconnect(); service.disconnect();

    expect(subscription.unsubscribe).toHaveBeenCalledTimes(1);
    expect(client.deactivate).toHaveBeenCalledOnceWith({ force:false });
  });

  it('usa sólo el retry manual y agenda como máximo un timer por cierre', fakeAsync(() => {
    const service = new ScannerWebSocketService() as any;
    const closedClient = {};
    service.stopped = false; service.client = closedClient; service.attempts = 0;
    spyOn(service, 'activate');

    service.scheduleReconnect(closedClient); service.scheduleReconnect(closedClient);
    expect(service.attempts).toBe(1);
    tick(1000);
    expect(service.activate).toHaveBeenCalledTimes(1);
  }));
});
