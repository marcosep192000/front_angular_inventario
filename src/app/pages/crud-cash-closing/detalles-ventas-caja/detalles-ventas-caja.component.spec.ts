import { DetallesVentasCajaComponent } from './detalles-ventas-caja.component';

describe('DetallesVentasCajaComponent pagos comerciales', () => {
  let component: DetallesVentasCajaComponent;
  beforeEach(() => component = Object.create(DetallesVentasCajaComponent.prototype));

  const venta = (pagos: any[]) => ({
    movimiento: { id: 1, tipo: 'INGRESO', monto: 120835.04, medioPago: 'EFECTIVO', categoriaMovimiento: 'VENTA' },
    movimientos: [{ id: 1, tipo: 'INGRESO', monto: 120835.04, medioPago: 'EFECTIVO', categoriaMovimiento: 'VENTA' }],
    montoCaja: 120835.04,
    ticket: { pagos },
  } as any);

  it('muestra el monto efectivo de una venta contado sin ID técnico', () => {
    expect(component.pagosVisibles(venta([{ id: 1, medioPago: 'EFECTIVO', monto: 120835.04 }]))).toEqual([{ medio: 'Efectivo', monto: 120835.04 }]);
  });

  it('muestra cuenta corriente como financiación y conserva su monto real', () => {
    expect(component.pagosVisibles(venta([{ id: 91, medioPago: 'CUENTA_CORRIENTE', monto: 100000 }]))).toEqual([{ medio: 'Cta. Cte.', monto: 100000 }]);
  });

  it('muestra ambos componentes reales de una venta mixta', () => {
    const pagos = component.pagosVisibles(venta([
      { id: 1, medioPago: 'EFECTIVO', monto: 120835.04 },
      { id: 2, medioPago: 'CUENTA_CORRIENTE', monto: 100000 },
    ]));
    expect(pagos).toEqual([{ medio: 'Efectivo', monto: 120835.04 }, { medio: 'Cta. Cte.', monto: 100000 }]);
    expect(JSON.stringify(pagos)).not.toContain('01');
  });
});
