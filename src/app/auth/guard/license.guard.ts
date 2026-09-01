import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { LICENSE_USABLE } from '../../interfaces/license';
import { LicenseService } from '../../services/license.service';
export const licenseGuard: CanActivateFn = () => { const api=inject(LicenseService), router=inject(Router); return api.obtenerEstado().pipe(map(s=>LICENSE_USABLE.includes(s.status)||router.parseUrl('/activacion')),catchError(()=>router.url==='/activacion'?of(true):of(router.parseUrl('/activacion?connectionError=1')))); };
