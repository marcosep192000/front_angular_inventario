import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environments } from '../../environments/environments';
import { ScannerService } from './scanner.service';

describe('ScannerService', () => {
  let service: ScannerService; let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers:[provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()] });
    service = TestBed.inject(ScannerService); http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('crea una sesión con el terminal centralizado', () => {
    service.createSession().subscribe();
    const request = http.expectOne(`${environments.baseURL}scanner/session`);
    expect(request.request.method).toBe('POST'); expect(request.request.headers.get('X-Terminal-Id')).toBe('CAJA-1');
    request.flush({ sessionId:'id', token:'token', scannerUrl:'http://lan/scanner/token', expiresAt:'2026-09-08T13:15:00Z' });
  });

  it('cierra por sessionId sin persistir el token scanner', () => {
    service.closeSession('session id').subscribe();
    const request = http.expectOne(`${environments.baseURL}scanner/session/session%20id`);
    expect(request.request.method).toBe('DELETE'); request.flush(null);
  });
});
