import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ResumenReporte } from './interfaces/reportes';
import { ReportesService } from './services/reportes.service';

@Component({
  selector: 'app-reporte-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `<section class="reporte">
    <p>Reportes › {{ area }} › {{ titulo }}</p>
    <h1>{{ titulo }}</h1>
    <span>{{ descripcion }}</span>
    <div class="filtros">
      <label>Desde<input type="date" [(ngModel)]="desde" /></label
      ><label>Hasta<input type="date" [(ngModel)]="hasta" /></label
      ><button (click)="consultar()">Consultar</button
      ><button (click)="limpiar()">Limpiar</button>
    </div>
    <div *ngIf="!consultado" class="estado">
      Seleccione los filtros y presione Consultar.
    </div>
    <div *ngIf="cargando" class="estado">Consultando reporte…</div>
    <div *ngIf="consultado && !cargando && sinDatos" class="estado">Sin datos para los filtros seleccionados.</div>
    <ng-container *ngIf="datos && !cargando && !sinDatos"
      ><div class="cards" *ngIf="!esLista">
        <article *ngFor="let item of entradas(datos)">
          <small>{{ item[0] }}</small
          ><strong>{{ item[1] | number: '1.2-2' : 'es-AR' }}</strong>
        </article>
      </div>
      <section class="ranking" *ngIf="esRanking && esLista">
        <article class="ranking-row" *ngFor="let fila of lista; let i = index">
          <span class="ranking-position" [class.podium]="i < 3">{{ i + 1 }}</span>
          <div class="ranking-product">
            <strong>{{ texto(fila['nombre'] ?? fila['name'], 'Producto sin nombre') }}</strong>
            <span>{{ texto(fila['codigo'] ?? fila['barCode'], 'Sin código') }}</span>
            <small>{{ estrellasRanking(i) }}</small>
          </div>
          <div class="ranking-metric">
            <small>Unidades vendidas</small>
            <strong>{{ numero(fila['cantidadVendida'] ?? fila['cantidad']) | number: '1.0-0' : 'es-AR' }}</strong>
          </div>
          <div class="ranking-metric revenue">
            <small>Facturación</small>
            <strong>{{ numero(fila['facturacion'] ?? fila['totalVenta']) | currency: 'ARS' : 'symbol' : '1.2-2' : 'es-AR' }}</strong>
          </div>
        </article>
      </section>
      <div class="tabla" *ngIf="esLista && !esRanking">
        <table>
          <thead>
            <tr>
              <th *ngFor="let c of columnas">{{ c }}</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let fila of lista">
                <td *ngFor="let c of columnas">{{ formatearCelda(c, fila[c]) }}</td>
            </tr>
          </tbody>
        </table>
      </div></ng-container
    >
  </section>`,
  styles: [
    `
      .reporte {
        width: 100%;
        max-width: none;
        margin: 0;
        padding: 26px 32px;
        box-sizing: border-box;
      }
      .reporte > p {
        color: #7955bb;
        font-weight: 700;
      }
      .filtros {
        display: flex;
        gap: 12px;
        align-items: end;
        margin: 20px 0;
        padding: 16px;
        border: 1px solid #e4ddec;
        border-radius: 12px;
        background: #faf8fd;
      }
      .filtros label {
        display: grid;
        gap: 4px;
        font-size: 0.8rem;
      }
      .filtros input,
      .filtros button {
        padding: 9px;
        border-radius: 7px;
        border: 1px solid #dcd3ea;
      }
      .filtros button {
        background: #60399b;
        color: white;
        font-weight: 700;
      }
      .estado {
        padding: 26px;
        background: #f6f3fb;
        border-radius: 12px;
      }
      .cards {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
      }
      .cards article {
        padding: 16px;
        border: 1px solid #e4ddec;
        border-radius: 12px;
      }
      .cards small {
        display: block;
        color: #766d84;
      }
      .cards strong {
        font-size: 1.25rem;
      }
      .tabla {
        margin-top: 20px;
        overflow: visible;
        overflow-y: visible;
        border: 1px solid #e4ddec;
        border-radius: 14px;
        background: #fff;
        box-shadow: 0 6px 18px rgba(57, 33, 109, 0.06);
      }
      .tabla table {
        width: 100%;
        table-layout: fixed;
        border-collapse: collapse;
      }
      .tabla thead {
        background: linear-gradient(135deg, #f2ecfa, #faf8fd);
      }
      .tabla th {
        color: #57378a;
        font-size: 0.72rem;
        font-weight: 800;
        letter-spacing: 0.045em;
        text-transform: uppercase;
        white-space: nowrap;
      }
      .tabla th,
      .tabla td {
        padding: 14px 16px;
        border-bottom: 1px solid #eee8f4;
        text-align: left;
      }
      .tabla td { color: #443c50; font-size: 0.88rem; white-space: normal; overflow-wrap: anywhere; }
      .tabla tbody tr { transition: background 0.16s ease; }
      .tabla tbody tr:hover { background: #fbf9fe; }
      .tabla tbody tr:last-child td { border-bottom: 0; }
      .ranking { display: grid; gap: 10px; margin-top: 20px; }
      .ranking-row { display: grid; grid-template-columns: 46px minmax(160px, 1.8fr) minmax(120px, 1fr) minmax(140px, 1fr); gap: 16px; align-items: center; padding: 15px 18px; border: 1px solid #e8e0f0; border-radius: 14px; background: linear-gradient(100deg, #fff, #fbf9fe); box-shadow: 0 5px 16px rgba(57, 33, 109, .045); }
      .ranking-position { display: grid; width: 34px; height: 34px; place-items: center; border-radius: 50%; background: #ece3f6; color: #69469d; font-weight: 800; }
      .ranking-position.podium { color: #fff; background: linear-gradient(135deg, #f1c764, #d17d17); box-shadow: 0 5px 12px rgba(197, 125, 24, .25); }
      .ranking-product strong, .ranking-product span, .ranking-product small, .ranking-metric small, .ranking-metric strong { display: block; }
      .ranking-product strong { color: #41295f; }
      .ranking-product span, .ranking-metric small { margin-top: 2px; color: #81758f; font-size: .75rem; }
      .ranking-product small { color: #e3a82e; font-size: .8rem; letter-spacing: 1px; }
      .ranking-metric { text-align: right; }
      .ranking-metric strong { color: #513077; font-size: 1rem; }
      .ranking-metric.revenue strong { color: #177a59; }
      @media (max-width: 700px) {
        .reporte { padding: 16px; }
        .cards {
          grid-template-columns: repeat(2, 1fr);
        }
        .filtros {
          flex-wrap: wrap;
        }
        .ranking-row { grid-template-columns: 38px minmax(0, 1fr); gap: 10px; }
        .ranking-metric { grid-column: 2; display: flex; justify-content: space-between; text-align: left; }
      }
    `,
  ],
})
export class ReporteDetalleComponent implements OnInit {
  area = '';
  titulo = '';
  descripcion = '';
  endpoint = '';
  desde = '';
  hasta = '';
  consultado = false;
  cargando = false;
  datos: ResumenReporte | ResumenReporte[] | null = null;
  constructor(
    private route: ActivatedRoute,
    private service: ReportesService,
    private toast: ToastrService,
  ) {}
  ngOnInit() {
    const p = this.route.snapshot.params;
    this.area = p['area'];
    this.endpoint = `${p['area']}/${p['reporte'] === 'ranking' ? 'ranking-productos' : p['reporte']}`;
    this.titulo = p['reporte'] === 'ranking'
      ? 'Ranking de productos'
      : p['reporte'].replaceAll('-', ' ');
    this.descripcion =
      'Consultá los indicadores y el detalle del período seleccionado.';

    // El backend aplica el período actual cuando no se envían fechas.
    // Cargamos el resumen inicial automáticamente, especialmente Caja.
    this.consultar();
  }
  consultar() {
    this.cargando = true;
    this.consultado = true;
    this.service
      .consultar(this.endpoint, {
        desde: this.desde,
        hasta: this.hasta,
        ...(this.esRanking ? { tipoRanking: 'MAS_VENDIDOS' as const } : {}),
      })
      .subscribe({
        next: (d) => {
          this.datos = d;
          this.cargando = false;
        },
        error: (e) => {
          this.cargando = false;
          const mensajeBackend = String(
            e.error?.error || e.error?.message || '',
          );
          const sinPermiso =
            e.status === 403 ||
            /access[_\s-]?denied|acceso denegado/i.test(mensajeBackend);

          this.toast.error(
            sinPermiso
              ? 'No tiene permisos para acceder a reportes. Cerrá sesión e iniciá nuevamente.'
              : mensajeBackend || 'No se pudo consultar el reporte',
          );
        },
      });
  }
  limpiar() {
    this.desde = '';
    this.hasta = '';
    this.datos = null;
    this.consultado = false;
  }
  get esLista() {
    return this.lista.length > 0;
  }
  get esRanking(): boolean {
    return this.endpoint === 'ventas/ranking-productos';
  }
  get sinDatos(): boolean {
    if (!this.datos) return true;
    if (this.esLista) return this.lista.length === 0;
    return this.entradas(this.datos).length === 0;
  }
  get lista() {
    if (Array.isArray(this.datos)) return this.datos;
    const respuesta = this.datos as Record<string, unknown> | null;
    const listado = respuesta?.['contenido'] ?? respuesta?.['detalle'];
    return Array.isArray(listado) ? listado as ResumenReporte[] : [];
  }
  get columnas() {
    return this.lista.length ? Object.keys(this.lista[0]) : [];
  }
  entradas(d: ResumenReporte | ResumenReporte[]): Array<[string, number]> {
    if (Array.isArray(d)) return [];
    const respuesta = d as Record<string, unknown>;
    const resumen = respuesta['resumen'];
    const origen = resumen && typeof resumen === 'object'
      ? resumen as Record<string, unknown>
      : respuesta;
    return Object.entries(origen)
      .filter(([, v]) => typeof v === 'number')
      .map(([clave, valor]) => [clave, Number(valor)]);
  }

  formatearCelda(campo: string, valor: unknown): string {
    if (valor === null || valor === undefined) return '-';
    const esMoneda = /total|venta|facturacion|facturación|costo|precio|ganancia|saldo|deuda|importe|pagado|capital|limite|límite|disponible|iva|impuesto/i.test(campo);
    if (esMoneda && typeof valor === 'number') {
      return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }).format(valor);
    }
    return String(valor);
  }

  texto(valor: unknown, predeterminado: string): string {
    return valor === null || valor === undefined || valor === '' ? predeterminado : String(valor);
  }

  numero(valor: unknown): number {
    return Number(valor ?? 0) || 0;
  }

  estrellasRanking(posicion: number): string {
    return '★'.repeat(Math.max(1, 5 - Math.floor(posicion / 2)));
  }
}
