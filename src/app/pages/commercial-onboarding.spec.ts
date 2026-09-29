import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { LoginComponent } from './login/login.component';
import { RegistroComponent } from './registro/registro.component';
import { LicenseComponent } from './license/license.component';
import { AccessoService } from '../services/accesso.service';
import { LicenseService } from '../services/license.service';
import { TokenService } from '../services/token.service';
import { ToastrService } from 'ngx-toastr';
import { LicenseStatus } from '../interfaces/license';

describe('onboarding comercial', () => {
  const validLicense: LicenseStatus = { status: 'VALID', activated: true, maxUsers: -1, currentUsers: 0, maxProducts: -1, currentProducts: 0, maxClients: -1, currentClients: 0 };

  it('/login permite navegar a /activacion y el login normal conserva su flujo', () => {
    const access = jasmine.createSpyObj<AccessoService>('AccessoService', ['login']);
    const router = jasmine.createSpyObj<Router>('Router', ['navigate', 'navigateByUrl']);
    const token = jasmine.createSpyObj<TokenService>('TokenService', ['setSession', 'getDefaultRoute']);
    const license = jasmine.createSpyObj<LicenseService>('LicenseService', ['obtenerEstado']);
    token.getDefaultRoute.and.returnValue('/dashboard');
    access.login.and.returnValue(of({ accessToken: 'access', username: 'admin', authorities: [], permissions: [] } as any));
    license.obtenerEstado.and.returnValue(of(validLicense));
    TestBed.configureTestingModule({ imports: [LoginComponent], providers: [FormBuilder, { provide: AccessoService, useValue: access }, { provide: Router, useValue: router }, { provide: TokenService, useValue: token }, { provide: LicenseService, useValue: license }] });
    const component = TestBed.createComponent(LoginComponent).componentInstance;

    component.goToActivation();
    expect(router.navigate).toHaveBeenCalledWith(['/activacion']);

    component.formGroup.setValue({ email: 'admin@example.test', password: 'temporary-password' });
    component.iniciarSession();
    expect(token.setSession).toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('una activación válida sin sesión permite continuar al registro inicial', () => {
    const api = jasmine.createSpyObj<LicenseService>('LicenseService', ['activar', 'obtenerEstado']);
    const router = jasmine.createSpyObj<Router>('Router', ['navigate', 'navigateByUrl']);
    const token = jasmine.createSpyObj<TokenService>('TokenService', ['isTokenValid', 'getDefaultRoute']);
    const toast = jasmine.createSpyObj<ToastrService>('ToastrService', ['success', 'error', 'warning']);
    token.isTokenValid.and.returnValue(false);
    api.activar.and.returnValue(of(validLicense));
    const component = new LicenseComponent(api, router, token, toast);
    component.license = 'PIXELS-TEST-KEY';
    component.activate();
    expect(component.activationSucceeded).toBeTrue();
    component.continueToRegistration();
    expect(router.navigate).toHaveBeenCalledWith(['/registro']);
  });

  it('/registro valida sólo email y contraseña, usa POST existente y no persiste la contraseña', () => {
    const access = jasmine.createSpyObj<AccessoService>('AccessoService', ['registrarse']);
    const router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    access.registrarse.and.returnValue(of({ token: 'server-token' } as any));
    localStorage.removeItem('token');
    TestBed.configureTestingModule({ imports: [RegistroComponent], providers: [FormBuilder, { provide: AccessoService, useValue: access }, { provide: Router, useValue: router }] });
    const component = TestBed.createComponent(RegistroComponent).componentInstance;
    expect(component.form.invalid).toBeTrue();
    component.form.setValue({ email: 'admin@example.test', password: 'temporary-password' });
    component.register();
    expect(access.registrarse).toHaveBeenCalledWith(jasmine.objectContaining({ email: 'admin@example.test', password: 'temporary-password' }));
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
    expect(localStorage.getItem('token')).toBeNull();
  });
});
