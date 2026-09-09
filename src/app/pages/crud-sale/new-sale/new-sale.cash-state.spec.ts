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

  it('consulta el PuntoCaja seleccionado y no envía una caja histórica', () => {
    const component: any = Object.create(NewSaleComponent.prototype);
    const getCajas = jasmine.createSpy().and.returnValue(of({ id: 99 }));
    component.cajaService = { getCajas };
    component.puntosCaja = [{ id: 2, nombre: 'Caja 2', activo: true }];
    component.puntoCajaId = 2;
    component.cargarEstadoCaja();
    expect(getCajas).toHaveBeenCalledOnceWith(2);
  });

  it('trata la ausencia de caja activa como caja cerrada', () => {
    const component: any = Object.create(NewSaleComponent.prototype);
    component.cajaService = { getCajas: () => throwError(() => new Error('sin caja')) };
    component.cargarEstadoCaja();
    expect(component.cajaAbierta).toBeFalse();
    expect(component.consultandoCaja).toBeFalse();
  });
});
