import { FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { MovimientoFormComponent, mensajeErrorEmpleados, mensajeErrorMovimiento } from './movimiento-form.component';

describe('mensajeErrorMovimiento', () => {
  it('muestra el mensaje humano del backend sin agregar el error genérico', () => {
    const message = mensajeErrorMovimiento({ error: { message: 'Saldo insuficiente en caja. Disponible: $0,00. Intentás retirar: $1.000,00.' } });
    expect(message).toContain('Disponible: $0,00');
    expect(message).toContain('Intentás retirar: $1.000,00');
    expect(message).not.toContain('Error al guardar movimiento');
  });

  it('usa un fallback humano ante un error desconocido', () => {
    expect(mensajeErrorMovimiento({ status: 500 })).toBe('No se pudo registrar el movimiento.');
  });
});

describe('MovimientoFormComponent - carga de empleados', () => {
  function setup(employeeResult = of([{ id: 1, nombre: 'Ana' }])) {
    const empleadoService = { getAll: jasmine.createSpy('getAll').and.returnValue(employeeResult) };
    const movimientoService = { create: jasmine.createSpy('create') };
    const toast = { error: jasmine.createSpy('error'), warning: jasmine.createSpy('warning'), success: jasmine.createSpy('success') };
    const ref = { close: jasmine.createSpy('close') };
    const component = new MovimientoFormComponent(new FormBuilder(), movimientoService as any, empleadoService as any, toast as any, ref as any, {});
    component.ngOnInit();
    return { component, empleadoService, toast };
  }

  it('no consulta empleados al abrir ni al elegir GASTO_MENOR', () => {
    const { component, empleadoService } = setup();
    expect(empleadoService.getAll).not.toHaveBeenCalled();
    component.movimientoForm.patchValue({ tipo: 'EGRESO', categoriaMovimiento: 'GASTO_MENOR' });
    component.onCategoriaChange();
    expect(empleadoService.getAll).not.toHaveBeenCalled();
  });

  it('consulta una sola vez al elegir una categoría de sueldo y carga el selector', () => {
    const { component, empleadoService } = setup();
    component.movimientoForm.patchValue({ categoriaMovimiento: 'PAGO_SUELDO' }); component.onCategoriaChange();
    component.movimientoForm.patchValue({ categoriaMovimiento: 'ADELANTO' }); component.onCategoriaChange();
    expect(empleadoService.getAll).toHaveBeenCalledTimes(1);
    expect(component.empleados.length).toBe(1);
  });

  it('trata una lista vacía como estado válido', () => {
    const { component, toast } = setup(of([]));
    component.movimientoForm.patchValue({ categoriaMovimiento: 'PAGO_SUELDO' }); component.onCategoriaChange();
    expect(component.empleadosCargados).toBeTrue(); expect(component.empleados).toEqual([]); expect(toast.error).not.toHaveBeenCalled();
  });

  it('muestra el error humano y no bloquea luego GASTO_MENOR', () => {
    const { component, empleadoService, toast } = setup(throwError(() => ({ error: {} })));
    component.movimientoForm.patchValue({ categoriaMovimiento: 'PAGO_SUELDO' }); component.onCategoriaChange();
    expect(toast.error).toHaveBeenCalledOnceWith('No se pudieron cargar los empleados.');
    component.movimientoForm.patchValue({ categoriaMovimiento: 'GASTO_MENOR' }); component.onCategoriaChange();
    expect(empleadoService.getAll).toHaveBeenCalledTimes(1);
  });
});

describe('mensajeErrorEmpleados', () => {
  it('reutiliza un mensaje humano del backend', () => expect(mensajeErrorEmpleados({ error: { message: 'Servicio temporalmente no disponible.' } })).toBe('Servicio temporalmente no disponible.'));
});
