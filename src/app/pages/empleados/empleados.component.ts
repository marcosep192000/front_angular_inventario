import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Client } from '../../interfaces/Client';
import { Empleado, EstadoCuentaEmpleado, FrecuenciaPagoEmpleado, LiquidacionSueldo, PagoEmpleado } from '../../interfaces/empleado';
import { ClientService } from '../../services/client.service';
import { EmpleadoService } from '../../services/empleado.service';

interface FormEmpleado { nombre: string; apellido: string; dni: string; sueldo: number; puesto: string; fechaIngreso: string; activo: boolean; tipoContrato: string; frecuenciaPago: FrecuenciaPagoEmpleado; clienteId: number | null; }

@Component({ selector: 'app-confirmar-accion-nomina', standalone: true, imports: [CommonModule, MatButtonModule, MatDialogModule, MatIconModule], template: `<section class="confirmar"><div class="icono"><mat-icon>{{ data.icono }}</mat-icon></div><h2>{{ data.titulo }}</h2><p>{{ data.mensaje }}</p><strong>{{ data.detalle }}</strong><mat-dialog-actions align="end"><button mat-button [mat-dialog-close]="false">Volver</button><button mat-raised-button color="primary" [mat-dialog-close]="true">{{ data.accion }}</button></mat-dialog-actions></section>`, styles: [`.confirmar{max-width:430px;padding:24px;text-align:center}.icono{display:grid;width:56px;height:56px;margin:0 auto 12px;place-items:center;border-radius:16px;color:#fff;background:linear-gradient(135deg,#68419d,#926bc8)}.icono mat-icon{width:30px;height:30px;font-size:30px}.confirmar h2{margin:6px 0;color:#392452}.confirmar p{margin:8px 0;color:#746a7e;line-height:1.45}.confirmar strong{display:block;margin:14px 0;padding:11px;border-radius:9px;color:#573580;background:#f3edf9}mat-dialog-actions{margin-top:8px}`] })
export class ConfirmarAccionNominaComponent { constructor(@Inject(MAT_DIALOG_DATA) public data: { titulo: string; mensaje: string; detalle: string; accion: string; icono: string }, public ref: MatDialogRef<ConfirmarAccionNominaComponent>) {} }

@Component({
  selector: 'app-empleados', standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatTabsModule, MatTooltipModule, MatDialogModule],
  templateUrl: './empleados.component.html', styleUrl: './empleados.component.css'
})
export class EmpleadosComponent implements OnInit {
  empleados: Empleado[] = []; clientes: Client[] = []; seleccionado?: Empleado; estado?: EstadoCuentaEmpleado;
  liquidaciones: LiquidacionSueldo[] = []; editando?: Empleado; liquidacionAPagar?: LiquidacionSueldo;
  pagos: PagoEmpleado[] = []; busqueda = ''; soloActivos = true; mostrarFormulario = false; tabActiva = 0;
  cargando = false; guardando = false; descargando = false;
  adelanto = { monto: 0, medioPago: 'EFECTIVO', referencia: '', fecha: this.hoy(), observacion: '' };
  periodo = this.periodoActual(); reporte = this.periodoActual();
  form: FormEmpleado = this.formVacio();
  readonly medios = ['EFECTIVO','TRANSFERENCIA','DEBITO','CREDITO','MERCADO_PAGO','CHEQUE','OTRO'];

  constructor(private api: EmpleadoService, private clientesApi: ClientService, private toast: ToastrService, private dialog: MatDialog) {}
  ngOnInit(): void { this.cargar(); this.clientesApi.getClients().subscribe({ next: x => this.clientes = x }); }

  get empleadosFiltrados(): Empleado[] {
    const q = this.busqueda.trim().toLowerCase();
    return this.empleados.filter(e => (!this.soloActivos || e.activo) && (!q || `${e.nombre} ${e.apellido} ${e.dni} ${e.puesto || ''}`.toLowerCase().includes(q)));
  }
  get activos(): number { return this.empleados.filter(e => e.activo).length; }
  get pendientes(): number { return this.liquidaciones.filter(l => l.estado === 'PENDIENTE').length; }
  get totalPagos(): number { return this.pagos.reduce((total, pago) => total + Number(pago.monto || 0), 0); }
  get saldoPago(): number { return Number(this.liquidacionAPagar?.netoAPagar || 0) - this.totalPagos; }
  get remuneracionFrecuencia(): number { const sueldo = Number(this.form.sueldo || 0); return this.form.frecuenciaPago === 'SEMANAL' ? sueldo / 4 : this.form.frecuenciaPago === 'QUINCENAL' ? sueldo / 2 : sueldo; }
  get periodoDuplicado(): boolean { return this.liquidaciones.some(l => l.periodoDesde === this.periodo.desde && l.periodoHasta === this.periodo.hasta); }
  get etiquetaRemuneracion(): string { return this.form.frecuenciaPago === 'SEMANAL' ? 'Sueldo semanal' : this.form.frecuenciaPago === 'QUINCENAL' ? 'Sueldo quincenal' : 'Sueldo mensual'; }
  get remuneracionFormateada(): string { return this.moneda(this.remuneracionFrecuencia); }

  cargar(): void { this.cargando = true; this.api.getAll().subscribe({ next: x => { this.empleados = x; this.cargando = false; }, error: () => { this.cargando = false; this.toast.error('No se pudieron cargar los empleados.'); } }); }
  nuevo(): void { this.editando = undefined; this.form = this.formVacio(); this.mostrarFormulario = true; this.tabActiva = 0; }
  editar(e: Empleado): void { this.editando = e; this.form = { nombre: e.nombre, apellido: e.apellido, dni: e.dni, sueldo: e.sueldo, puesto: e.puesto || '', fechaIngreso: e.fechaIngreso || this.hoy(), activo: e.activo, tipoContrato: 'FULL_TIME', frecuenciaPago: e.frecuenciaPago, clienteId: e.clienteId ?? null }; this.mostrarFormulario = true; }
  cancelarFormulario(): void { this.mostrarFormulario = false; this.editando = undefined; this.form = this.formVacio(); }
  guardar(): void {
    if (!this.form.nombre.trim() || !this.form.apellido.trim() || !/^\d{7,11}$/.test(this.form.dni) || Number(this.form.sueldo) <= 0) { this.toast.warning('Revisá nombre, apellido, DNI y sueldo.'); return; }
    this.guardando = true; const data = { ...this.form, nombre: this.form.nombre.trim(), apellido: this.form.apellido.trim(), dni: this.form.dni.trim(), puesto: this.form.puesto.trim() };
    const op = this.editando ? this.api.actualizar(this.editando.id, data) : this.api.crear(data);
    op.subscribe({ next: empleado => { this.guardando = false; this.toast.success(this.editando ? 'Empleado actualizado.' : 'Empleado creado.'); this.cancelarFormulario(); this.cargar(); if (this.seleccionado?.id === empleado.id) this.seleccionar(empleado, false); }, error: e => { this.guardando = false; this.toast.error(e.error?.error || 'No se pudo guardar el empleado.'); } });
  }
  seleccionar(e: Empleado, abrirNomina = true): void {
    this.seleccionado = e; this.estado = undefined; this.liquidaciones = []; this.liquidacionAPagar = undefined;
    if (abrirNomina) this.tabActiva = 1;
    this.api.estadoCuenta(e.id).subscribe({ next: x => this.estado = x, error: () => this.estado = undefined });
    this.api.liquidaciones(e.id).subscribe({ next: x => this.liquidaciones = x, error: () => this.toast.error('No se pudieron cargar las liquidaciones.') });
  }
  desactivar(e: Empleado): void { if (!confirm(`¿Desactivar a ${e.nombre} ${e.apellido}?`)) return; this.api.desactivar(e.id).subscribe({ next: () => { this.toast.success('Empleado desactivado.'); if (this.seleccionado?.id === e.id) this.seleccionado = undefined; this.cargar(); }, error: err => this.toast.error(err.error?.error || 'No se pudo desactivar.') }); }
  registrarAdelanto(): void { if (!this.seleccionado || this.adelanto.monto <= 0) { this.toast.warning('Ingresá un monto válido.'); return; } this.confirmar('Confirmar adelanto', `Se registrará un adelanto para ${this.seleccionado.nombre} ${this.seleccionado.apellido}.`, `${this.moneda(this.adelanto.monto)} · ${this.adelanto.medioPago.replaceAll('_',' ')}`, 'Registrar adelanto', 'request_quote').subscribe(ok => { if (!ok || !this.seleccionado) return; this.api.adelanto(this.seleccionado.id, this.adelanto).subscribe({ next: () => { this.toast.success('Adelanto registrado.'); this.adelanto = { monto: 0, medioPago: 'EFECTIVO', referencia: '', fecha: this.hoy(), observacion: '' }; this.seleccionar(this.seleccionado!, false); }, error: e => this.toast.error(e.error?.error || 'No se pudo registrar el adelanto.') }); }); }
  liquidar(): void { if (!this.seleccionado || !this.periodo.desde || !this.periodo.hasta || this.periodo.desde > this.periodo.hasta) { this.toast.warning('Revisá el período de liquidación.'); return; } if (this.periodoDuplicado) { this.toast.warning('Ya existe una liquidación para ese período.'); return; } this.confirmar('Confirmar liquidación', `Se creará la liquidación de ${this.seleccionado.nombre} ${this.seleccionado.apellido}.`, `${this.fechaCorta(this.periodo.desde)} al ${this.fechaCorta(this.periodo.hasta)}`, 'Crear liquidación', 'event_available').subscribe(ok => { if (!ok || !this.seleccionado) return; this.api.crearLiquidacion(this.seleccionado.id, { periodoDesde: this.periodo.desde, periodoHasta: this.periodo.hasta, observacion: this.periodo.observacion }).subscribe({ next: () => { this.toast.success('Liquidación creada.'); this.seleccionar(this.seleccionado!, false); }, error: e => this.toast.error(e.error?.error || 'No se pudo crear la liquidación.') }); }); }
  prepararPago(l: LiquidacionSueldo): void { this.liquidacionAPagar = l; this.pagos = [{ medioPago: 'EFECTIVO', monto: Number(l.netoAPagar), referencia: '' }]; }
  agregarMedio(): void { this.pagos.push({ medioPago: 'TRANSFERENCIA', monto: Math.max(0, this.saldoPago), referencia: '' }); }
  quitarMedio(index: number): void { if (this.pagos.length > 1) this.pagos.splice(index, 1); }
  pagar(): void { const l = this.liquidacionAPagar; if (!l) return; if (Math.abs(this.saldoPago) > .01 || this.pagos.some(p => Number(p.monto) <= 0)) { this.toast.warning('La suma de los medios debe coincidir con el neto a pagar.'); return; } this.api.pagarLiquidacion(l.id, this.pagos).subscribe({ next: () => { this.toast.success('Pago registrado correctamente.'); this.liquidacionAPagar = undefined; this.pagos = []; this.seleccionar(this.seleccionado!, false); }, error: e => this.toast.error(e.error?.error || 'No se pudo registrar el pago.') }); }
  descargar(): void { if (!this.reporte.desde || !this.reporte.hasta || this.reporte.desde > this.reporte.hasta) { this.toast.warning('Revisá el período del reporte.'); return; } this.descargando = true; this.api.reportePdf(this.reporte.desde, this.reporte.hasta).subscribe({ next: b => { const u = URL.createObjectURL(b), a = document.createElement('a'); a.href = u; a.download = `nomina-${this.reporte.desde}-${this.reporte.hasta}.pdf`; a.click(); URL.revokeObjectURL(u); this.descargando = false; }, error: () => { this.descargando = false; this.toast.error('No se pudo descargar el reporte.'); } }); }
  etiquetaFrecuencia(valor: string): string { return ({ SEMANAL: 'Semanal', QUINCENAL: 'Quincenal', MENSUAL: 'Mensual' } as Record<string,string>)[valor] || valor; }
  moneda(valor: number): string { return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }).format(Number(valor || 0)); }
  fechaCorta(valor: string): string { return valor ? valor.split('-').reverse().join('/') : '-'; }
  private confirmar(titulo: string, mensaje: string, detalle: string, accion: string, icono: string) { return this.dialog.open(ConfirmarAccionNominaComponent, { width: '440px', maxWidth: '94vw', autoFocus: false, data: { titulo, mensaje, detalle, accion, icono } }).afterClosed(); }
  private hoy(): string { return new Date().toISOString().slice(0,10); }
  private periodoActual() { const hoy = new Date(); const desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1); return { desde: `${desde.getFullYear()}-${String(desde.getMonth()+1).padStart(2,'0')}-01`, hasta: this.hoy(), observacion: '' }; }
  private formVacio(): FormEmpleado { return { nombre: '', apellido: '', dni: '', sueldo: 0, puesto: '', fechaIngreso: this.hoy(), activo: true, tipoContrato: 'FULL_TIME', frecuenciaPago: 'MENSUAL', clienteId: null }; }
}
