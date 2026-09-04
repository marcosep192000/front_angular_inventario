import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environments } from '../../environments/environments';
import { ArcaService } from './arca.service';

describe('ArcaService fiscal PDF contract', () => {
  let service: ArcaService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(ArcaService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('requests the unified ticket PDF as a Blob', () => {
    const pdf = new Blob(['%PDF'], { type: 'application/pdf' });
    let received: Blob | undefined;

    service.getTicketPdf(42).subscribe((value) => (received = value));

    const request = http.expectOne(`${environments.baseURL}ticket/42/pdf`);
    expect(request.request.method).toBe('GET');
    expect(request.request.responseType).toBe('blob');
    request.flush(pdf);
    expect(received?.type).toBe('application/pdf');
  });
});
