import { of, throwError } from 'rxjs';
import { NewSaleComponent } from './new-sale.component';

describe('NewSaleComponent cash state', () => {
  it('refleja una caja abierta informada por el backend', () => {
    const component: any = Object.create(NewSaleComponent.prototype);
    component.cajaService = { getCajas: () => of({ id: 1 }) };
    component.cargarEstadoCaja();
    expect(component.cajaAbierta).toBeTrue();
    expect(component.consultandoCaja).toBeFalse();
  });

  it('trata la ausencia de caja activa como caja cerrada', () => {
    const component: any = Object.create(NewSaleComponent.prototype);
    component.cajaService = { getCajas: () => throwError(() => new Error('sin caja')) };
    component.cargarEstadoCaja();
    expect(component.cajaAbierta).toBeFalse();
    expect(component.consultandoCaja).toBeFalse();
  });
});
