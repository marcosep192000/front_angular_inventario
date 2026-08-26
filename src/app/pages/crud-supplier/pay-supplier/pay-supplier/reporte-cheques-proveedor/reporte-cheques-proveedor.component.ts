import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { forkJoin } from 'rxjs';

import { ChequeProveedor } from '../../../../../interfaces/cheque-proveedor';
import { SupplierPaymentService } from '../../../../../services/supplier-payment.service';

interface ReporteChequesData {
  proveedorId: number;
  proveedorNombre: string;
}

type EstadoReporte = 'pendientes' | 'cobrados' | 'rechazados';

@Component({
  selector: 'app-reporte-cheques-proveedor',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTabsModule,
    MatTooltipModule,
  ],
  templateUrl: './reporte-cheques-proveedor.component.html',
  styleUrl: './reporte-cheques-proveedor.component.css',
})
export class ReporteChequesProveedorComponent implements OnInit {
  readonly columnas = [
    'numero',
    'banco',
    'titular',
    'monto',
    'emision',
    'cobro',
    'estado',
  ];

  pendientes: ChequeProveedor[] = [];
  cobrados: ChequeProveedor[] = [];
  rechazados: ChequeProveedor[] = [];
  cargando = true;
  error = false;
  pagina = 0;
  tamanioPagina = 10;
  estadoActual: EstadoReporte = 'pendientes';

  constructor(
    private readonly supplierPaymentService: SupplierPaymentService,
    private readonly dialogRef: MatDialogRef<ReporteChequesProveedorComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: ReporteChequesData,
  ) {}

  ngOnInit(): void {
    this.cargarReporte();
  }

  cargarReporte(): void {
    this.cargando = true;
    this.error = false;

    forkJoin({
      pendientes: this.supplierPaymentService.getChequesPendientesProveedor(
        this.data.proveedorId,
      ),
      cobrados: this.supplierPaymentService.getChequesCobradosProveedor(
        this.data.proveedorId,
      ),
      rechazados: this.supplierPaymentService.getChequesRechazadosProveedor(
        this.data.proveedorId,
      ),
    }).subscribe({
      next: (reporte) => {
        this.pendientes = Array.isArray(reporte.pendientes) ? reporte.pendientes : [];
        this.cobrados = Array.isArray(reporte.cobrados) ? reporte.cobrados : [];
        this.rechazados = Array.isArray(reporte.rechazados) ? reporte.rechazados : [];
        this.pagina = 0;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error cargando reporte de cheques:', error);
        this.error = true;
        this.cargando = false;
      },
    });
  }

  cambiarEstado(index: number): void {
    this.estadoActual = ['pendientes', 'cobrados', 'rechazados'][index] as EstadoReporte;
    this.pagina = 0;
  }

  cambiarPagina(event: PageEvent): void {
    this.pagina = event.pageIndex;
    this.tamanioPagina = event.pageSize;
  }

  get chequesActuales(): ChequeProveedor[] {
    switch (this.estadoActual) {
      case 'cobrados':
        return this.cobrados;
      case 'rechazados':
        return this.rechazados;
      default:
        return this.pendientes;
    }
  }

  get chequesPagina(): ChequeProveedor[] {
    const inicio = this.pagina * this.tamanioPagina;
    return this.chequesActuales.slice(inicio, inicio + this.tamanioPagina);
  }

  get tituloEstado(): string {
    return this.estadoActual.charAt(0).toUpperCase() + this.estadoActual.slice(1);
  }

  imprimir(): void {
    const ventana = window.open('', '_blank');

    if (!ventana) {
      return;
    }

    const filas = this.chequesActuales
      .map((cheque) => `
        <tr>
          <td>${this.escaparHtml(cheque.numeroCheque)}</td>
          <td>${this.escaparHtml(cheque.banco)}</td>
          <td>${this.escaparHtml(cheque.titularCheque)}</td>
          <td>${this.formatearMoneda(cheque.monto)}</td>
          <td>${this.formatearFecha(cheque.fechaEmision)}</td>
          <td>${this.formatearFecha(cheque.fechaCobro)}</td>
          <td>${this.escaparHtml(cheque.estado)}</td>
        </tr>`,
      )
      .join('');

    ventana.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8">
      <title>Reporte de cheques</title>
      <style>body{font-family:Arial,sans-serif;color:#222;padding:28px}h1{margin:0 0 8px}p{margin:4px 0 22px;color:#555}table{border-collapse:collapse;width:100%;font-size:12px}th,td{border:1px solid #bbb;padding:8px;text-align:left}th{background:#f1f1f1}@media print{body{padding:0}}</style>
      </head><body><h1>Reporte de cheques ${this.escaparHtml(this.tituloEstado)}</h1>
      <p>Proveedor: ${this.escaparHtml(this.data.proveedorNombre)} · Generado: ${new Date().toLocaleDateString('es-AR')}</p>
      <table><thead><tr><th>Número</th><th>Banco</th><th>Titular</th><th>Monto</th><th>Emisión</th><th>Cobro</th><th>Estado</th></tr></thead><tbody>${filas}</tbody></table>
      </body></html>`);
    ventana.document.close();
    ventana.focus();
    ventana.print();
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  private formatearMoneda(monto: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(Number(monto) || 0);
  }

  private formatearFecha(fecha: string): string {
    return fecha ? new Date(fecha).toLocaleDateString('es-AR') : '-';
  }

  private escaparHtml(valor: unknown): string {
    return String(valor ?? '-').replace(/[&<>"']/g, (caracter) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    })[caracter] ?? caracter);
  }
}
