import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormCtaCteClienteComponent } from './form-cta-cte-cliente.component';

describe('FormCtaCteClienteComponent', () => {
  let component: FormCtaCteClienteComponent;
  let fixture: ComponentFixture<FormCtaCteClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormCtaCteClienteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FormCtaCteClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
