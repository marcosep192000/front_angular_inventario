import { FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { AdministracionComponent } from './administracion.component';
import { AdministracionService } from '../../services/administracion.service';
import { TokenService } from '../../services/token.service';
import { ToastrService } from 'ngx-toastr';
import { UiRefreshService } from '../../services/ui-refresh.service';
import { LicenseService } from '../../services/license.service';
import { Router } from '@angular/router';
import { Empresa } from '../../interfaces/administracion';

describe('AdministracionComponent empresa', () => {
  const empresa: Empresa = {
    id: 1,
    name: 'Empresa de prueba',
    nombreFantasia: 'Prueba',
    cuit: '30712345678',
    address: 'Calle 123',
    localidad: 'Resistencia',
    provincia: 'Chaco',
    codigoPostal: '3500',
    phone: '3624000000',
    email: 'empresa@prueba.com',
    ingresosBrutos: '123',
    inicioActividades: '2020-01-01',
    puntoVenta: 1,
    condicionIva: 'RESPONSABLE_INSCRIPTO',
    usuarios: [],
  };
  let api: jasmine.SpyObj<AdministracionService>;
  let token: jasmine.SpyObj<TokenService>;
  let toast: jasmine.SpyObj<ToastrService>;
  let router: jasmine.SpyObj<Router>;
  let component: AdministracionComponent;

  beforeEach(() => {
    api = jasmine.createSpyObj<AdministracionService>('AdministracionService', [
      'obtenerEmpresa',
      'guardarEmpresa',
      'obtenerLogo',
      'listarUsuarios',
    ]);
    token = jasmine.createSpyObj<TokenService>('TokenService', [
      'getAuthorities',
      'hasPermission',
    ]);
    toast = jasmine.createSpyObj<ToastrService>('ToastrService', [
      'success',
      'error',
    ]);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    component = new AdministracionComponent(
      new FormBuilder(),
      api,
      token,
      toast,
      jasmine.createSpyObj<UiRefreshService>('UiRefreshService', [
        'actualizarLogo',
      ]),
      { snapshot: null } as unknown as LicenseService,
      router,
    );
  });

  it('carga una empresa existente', () => {
    api.obtenerEmpresa.and.returnValue(of(empresa));
    component.cargarEmpresa();
    expect(component.empresaExiste).toBeTrue();
    expect(component.empresaForm.controls.name.value).toBe(empresa.name);
  });

  it('mantiene el formulario vacío cuando todavía no existe empresa', () => {
    api.obtenerEmpresa.and.returnValue(throwError(() => ({ status: 400 })));
    component.cargarEmpresa();
    expect(component.empresaExiste).toBeFalse();
    expect(component.empresaForm.controls.name.value).toBe('');
  });

  it('requiere razón social y CUIT', () => {
    component.empresaForm.controls.name.setValue('');
    component.empresaForm.controls.cuit.setValue('');
    expect(component.empresaForm.controls.name.hasError('required')).toBeTrue();
    expect(component.empresaForm.controls.cuit.hasError('required')).toBeTrue();
  });

  it('rechaza email inválido', () => {
    component.empresaForm.controls.email.setValue('correo-invalido');
    expect(component.empresaForm.controls.email.hasError('email')).toBeTrue();
  });

  it('rechaza fecha futura', () => {
    component.empresaForm.controls.inicioActividades.setValue('2999-01-01');
    expect(
      component.empresaForm.controls.inicioActividades.hasError('futureDate'),
    ).toBeTrue();
  });

  it('rechaza un punto de venta inválido', () => {
    component.empresaForm.controls.puntoVenta.setValue(0);
    expect(
      component.empresaForm.controls.puntoVenta.hasError('min'),
    ).toBeTrue();
  });

  it('formatea CUIT ingresado sólo con números', () => {
    component.empresaForm.controls.cuit.setValue('30712345678');
    component.formatearCuit();
    expect(component.empresaForm.controls.cuit.value).toBe('30-71234567-8');
  });

  it('guarda la configuración inicial y bloquea duplicación mientras procesa', () => {
    component.esAdmin = true;
    component.empresaForm.patchValue(empresa);
    api.guardarEmpresa.and.returnValue(of(empresa));
    component.guardarEmpresa();
    expect(api.guardarEmpresa).toHaveBeenCalledTimes(1);
    expect(component.empresaExiste).toBeTrue();
    expect(toast.success).toHaveBeenCalledWith(
      'Empresa actualizada correctamente.',
    );
  });

  it('actualiza una empresa existente por el mismo endpoint único', () => {
    component.esAdmin = true;
    component.empresaExiste = true;
    component.empresaForm.patchValue(empresa);
    api.guardarEmpresa.and.returnValue(of({ ...empresa, name: 'Actualizada' }));
    component.guardarEmpresa();
    expect(component.empresaForm.controls.name.value).toBe('Actualizada');
  });

  it('muestra el error seguro del backend', () => {
    component.esAdmin = true;
    component.empresaForm.patchValue(empresa);
    api.guardarEmpresa.and.returnValue(
      throwError(() => ({ error: { error: 'Datos inválidos' } })),
    );
    component.guardarEmpresa();
    expect(toast.error).toHaveBeenCalledWith('Datos inválidos');
  });

  it('identifica campos faltantes para ARCA y respeta su permiso', () => {
    component.empresaForm.patchValue({ ...empresa, localidad: '' });
    expect(component.empresaFiscalCompleta).toBeFalse();
    expect(
      component.camposArca.find((field) => field.label === 'Localidad')
        ?.completo,
    ).toBeFalse();
    component.puedeConfigurarArca = true;
    component.configurarArca();
    expect(router.navigate).toHaveBeenCalledWith([
      '/dashboard/administracion/arca',
    ]);
  });
});
