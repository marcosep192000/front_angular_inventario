import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/** Canal liviano para refrescar información visible sin recargar la página. */
@Injectable({ providedIn: 'root' })
export class UiRefreshService {
  private readonly logoActualizadoSource = new Subject<void>();
  private readonly fotoUsuarioActualizadaSource = new Subject<void>();
  private readonly dashboardActualizadoSource = new Subject<void>();

  readonly logoActualizado$ = this.logoActualizadoSource.asObservable();
  readonly fotoUsuarioActualizada$ = this.fotoUsuarioActualizadaSource.asObservable();
  readonly dashboardActualizado$ = this.dashboardActualizadoSource.asObservable();

  actualizarLogo(): void { this.logoActualizadoSource.next(); }
  actualizarFotoUsuario(): void { this.fotoUsuarioActualizadaSource.next(); }
  actualizarDashboard(): void { this.dashboardActualizadoSource.next(); }
}
