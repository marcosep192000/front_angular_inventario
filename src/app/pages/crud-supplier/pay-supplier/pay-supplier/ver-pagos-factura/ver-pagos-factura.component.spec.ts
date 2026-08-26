import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerPagosFacturaComponent } from './ver-pagos-factura.component';

describe('VerPagosFacturaComponent', () => {
  let component: VerPagosFacturaComponent;
  let fixture: ComponentFixture<VerPagosFacturaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerPagosFacturaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VerPagosFacturaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
