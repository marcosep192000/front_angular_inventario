import { TestBed } from '@angular/core/testing';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import locale from '@angular/common/locales/es-AR';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { DashboardService } from '../../../../../../services/dashboard.service';
import { InicioBajoStockComponent } from './inicio-bajo-stock.component';

describe('dashboard con stock moderno', () => {
  beforeEach(async () => {
    registerLocaleData(locale);
    await TestBed.configureTestingModule({imports:[InicioBajoStockComponent],providers:[provideRouter([]),
      {provide:LOCALE_ID,useValue:'es-AR'},
      {provide:DashboardService,useValue:{getProductosBajoStock:()=>of([
        {productId:1,name:'Decimal sin código',barCode:null,availableStock:5.5,minimumStock:5.5,stock:999,stockMin:0},
        {productId:2,name:'Variantes',availableStock:13,minimumStock:15,variantStockManaged:true,stock:113},
        {productId:3,name:'Agotado',availableStock:0,minimumStock:2},
        {productId:4,name:'Normal',availableStock:2.25,minimumStock:2},
        {productId:5,name:'Histórico negativo',availableStock:-.25,minimumStock:2}
      ])}}
    ]}).compileComponents();
  });
  it('renderiza decimales, mínimo y suma activa recibida sin consultar aliases', () => {
    const f=TestBed.createComponent(InicioBajoStockComponent);f.detectChanges();
    const rows=Array.from(f.nativeElement.querySelectorAll('tbody tr')) as HTMLElement[];
    expect(rows[0].textContent).toContain('Decimal sin código');expect(rows[0].textContent).toContain('5,5');
    expect(rows[0].querySelectorAll('td')[2].textContent).toContain('5,5');
    expect(rows[1].textContent).toContain('13');expect(rows[1].textContent).not.toContain('113');
    expect(f.nativeElement.textContent).not.toContain('999');
  });
  it('clasifica igualdad con mínimo, cero y negativos consistentemente', () => {
    const f=TestBed.createComponent(InicioBajoStockComponent);f.detectChanges();
    const rows=Array.from(f.nativeElement.querySelectorAll('tbody tr')) as HTMLElement[];
    expect(rows[0].querySelector('.warning')).not.toBeNull();
    expect(rows[2].querySelector('.danger')).not.toBeNull();
    expect(rows[3].querySelector('.success')).not.toBeNull();
    expect(rows[4].querySelector('.danger')).not.toBeNull();
  });
});
