import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CompanyDocumentConfig } from '../../config/company-document.config';
import { Empresa } from '../../interfaces/administracion';
import { AdministracionService } from '../../services/administracion.service';
import { FiltrosReporte, ResumenReporte } from './interfaces/reportes';
import { ReportesService } from './services/reportes.service';

type CampoFiltro = keyof FiltrosReporte;
interface Opcion { valor: string | boolean; etiqueta: string; }
interface FiltroUi { campo: CampoFiltro; etiqueta: string; tipo?: 'date' | 'number' | 'select'; opciones?: Opcion[]; min?: number; max?: number; }
interface ConfigReporte { titulo: string; descripcion: string; filtros: FiltroUi[]; paginado?: boolean; }
const opciones = (valores: string[]): Opcion[] => valores.map(valor => ({ valor, etiqueta: valor.replaceAll('_', ' ') }));
const FECHAS: FiltroUi[] = [{ campo: 'desde', etiqueta: 'Desde', tipo: 'date' }, { campo: 'hasta', etiqueta: 'Hasta', tipo: 'date' }];
const PAGINA: FiltroUi[] = [{ campo: 'page', etiqueta: 'Página', tipo: 'number', min: 0 }, { campo: 'size', etiqueta: 'Resultados', tipo: 'number', min: 1, max: 500 }];
const MEDIOS = opciones(['EFECTIVO','TRANSFERENCIA','DEBITO','PAGO_CTA_CTE','CREDITO','MERCADO_PAGO','CHEQUE','CUENTA_CORRIENTE','OTRO']);
const ETIQUETAS_CORTAS: Record<string, string> = {
  cantidadProductosVendidos: 'Productos vendidos', cantidadClientesConDeuda: 'Clientes con deuda',
  cantidadFacturasPendientes: 'Facturas pendientes', cantidadComprobantes: 'Comprobantes',
  cantidadOperaciones: 'Operaciones', cantidadProductos: 'Productos', cantidadVentas: 'Ventas',
  cantidadFacturas: 'Facturas', cantidadClientes: 'Clientes', precioVentaPromedio: 'Precio prom.',
  costoMercaderiaVendida: 'Costo mercadería', margenPorcentaje: 'Margen %', porcentajeParticipacion: 'Participación %',
  gananciaPotencial: 'Ganancia potencial', capitalInmovilizado: 'Capital inmóvil', productosInmovilizados: 'Productos inmóviles',
  unidadesInmovilizadas: 'Unidades inmóviles', valorStockCosto: 'Valor costo', valorStockVenta: 'Valor venta',
  costoUnitario: 'Costo unit.', precioVenta: 'Precio venta', unidadesStock: 'Unidades', stockActual: 'Stock',
  stockMinimo: 'Stock mín.', ventasUltimos30Dias: 'Ventas 30 días', fechaUltimaVenta: 'Última venta',
  ultimaVenta: 'Última venta', ultimaCompra: 'Última compra', limiteCredito: 'Límite crédito',
  proximoVencimiento: 'Próx. vencimiento', variacionPorcentaje: 'Variación %',
  movimientosPorMedioPago: 'Movimientos por pago', medioPago: 'Medio de pago',
  fechaApertura: 'Apertura', fechaCierre: 'Cierre', montoInicial: 'Monto inicial',
  ventasEfectivo: 'Ventas efectivo', otrosIngresos: 'Otros ingresos', efectivoEsperado: 'Efectivo esperado',
  efectivoContado: 'Efectivo contado', totalElementos: 'Resultados', totalPorCobrar: 'Total a cobrar',
  deudaPorVencer: 'Por vencer', totalPendiente: 'Pendiente', totalVencido: 'Vencido',
  numeroFactura: 'N.º factura', proveedorId: 'ID proveedor', productoId: 'ID producto', clienteId: 'ID cliente',
};

const CONFIG: Record<string, ConfigReporte> = {
  'ventas/resumen': { titulo: 'Resumen de ventas', descripcion: 'Totales, impuestos, ticket promedio y evolución del período.', filtros: [...FECHAS,
    { campo: 'clienteId', etiqueta: 'ID cliente', tipo: 'number', min: 1 },
    { campo: 'tipoComprobante', etiqueta: 'Comprobante', tipo: 'select', opciones: opciones(['FACTURA_A','FACTURA_B','FACTURA_C','PRESUPUESTO','REMITO','NOTA_CREDITO_A','NOTA_CREDITO_B','NOTA_CREDITO_C','NOTA_DEBITO_A','NOTA_DEBITO_B','NOTA_DEBITO_C']) },
    { campo: 'condicionVenta', etiqueta: 'Condición', tipo: 'select', opciones: opciones(['CONTADO','CTA_CTE']) }, { campo: 'medioPago', etiqueta: 'Medio de pago', tipo: 'select', opciones: MEDIOS }] },
  'ventas/productos': { titulo: 'Ventas por producto', descripcion: 'Facturación, costos, ganancia y margen por producto.', paginado: true, filtros: [...FECHAS,
    { campo: 'productoId', etiqueta: 'ID producto', tipo: 'number', min: 1 }, { campo: 'categoriaId', etiqueta: 'ID categoría', tipo: 'number', min: 1 },
    { campo: 'marcaId', etiqueta: 'ID marca', tipo: 'number', min: 1 }, { campo: 'proveedorId', etiqueta: 'ID proveedor', tipo: 'number', min: 1 },
    { campo: 'sort', etiqueta: 'Orden', tipo: 'select', opciones: opciones(['facturacion,desc','cantidadVendida,desc','ganancia,desc','margenPorcentaje,desc']) }, ...PAGINA] },
  'ventas/ranking-productos': { titulo: 'Ranking de productos', descripcion: 'Productos destacados según el criterio seleccionado.', filtros: [...FECHAS,
    { campo: 'tipoRanking', etiqueta: 'Ranking', tipo: 'select', opciones: opciones(['MAS_VENDIDOS','MAYOR_FACTURACION','MAYOR_GANANCIA','MAYOR_MARGEN','MENOS_VENDIDOS','SIN_VENTAS']) }, { campo: 'limit', etiqueta: 'Cantidad', tipo: 'number', min: 1, max: 500 }] },
  'clientes/cuenta-corriente': { titulo: 'Cuentas corrientes', descripcion: 'Saldos, crédito disponible y deuda vencida de clientes.', filtros: [] },
  'clientes/antiguedad-deuda': { titulo: 'Antigüedad de deuda', descripcion: 'Deuda agrupada por tramos de antigüedad.', filtros: [] },
  'inventario/stock-valorizado': { titulo: 'Stock valorizado', descripcion: 'Valor de costo, venta y ganancia potencial del inventario.', filtros: [
    { campo: 'categoriaId', etiqueta: 'ID categoría', tipo: 'number', min: 1 }, { campo: 'marcaId', etiqueta: 'ID marca', tipo: 'number', min: 1 }, { campo: 'proveedorId', etiqueta: 'ID proveedor', tipo: 'number', min: 1 }] },
  'inventario/bajo-stock': { titulo: 'Productos con bajo stock', descripcion: 'Productos por debajo del stock mínimo.', paginado: true, filtros: [...PAGINA] },
  'inventario/sin-stock': { titulo: 'Productos sin stock', descripcion: 'Productos agotados y su actividad reciente.', paginado: true, filtros: [...PAGINA] },
  'inventario/inmovilizado': { titulo: 'Inventario inmovilizado', descripcion: 'Capital detenido en productos sin ventas recientes.', filtros: [{ campo: 'diasSinVenta', etiqueta: 'Días sin venta', tipo: 'number', min: 1, max: 3650 }] },
  'proveedores/compras': { titulo: 'Compras a proveedores', descripcion: 'Compras, pagos y saldos del período.', filtros: [...FECHAS,
    { campo: 'proveedorId', etiqueta: 'ID proveedor', tipo: 'number', min: 1 }, { campo: 'tipoCuenta', etiqueta: 'Tipo de cuenta', tipo: 'select', opciones: opciones(['CTA_CTE','CONTADO']) },
    { campo: 'estadoPago', etiqueta: 'Estado', tipo: 'select', opciones: [{ valor: true, etiqueta: 'Pagadas' }, { valor: false, etiqueta: 'Pendientes' }] }] },
  'proveedores/deuda': { titulo: 'Deuda con proveedores', descripcion: 'Deuda total, vencida y próximos vencimientos.', filtros: [] },
  'proveedores/evolucion-costos': { titulo: 'Evolución de costos', descripcion: 'Historial de costos de compra de un producto.', filtros: [{ campo: 'productoId', etiqueta: 'ID producto', tipo: 'number', min: 1 }] },
  'caja/resumen': { titulo: 'Resumen de caja', descripcion: 'Ingresos, egresos y movimientos por medio de pago.', filtros: [...FECHAS, { campo: 'cajaId', etiqueta: 'ID caja', tipo: 'number', min: 1 }, { campo: 'medioPago', etiqueta: 'Medio de pago', tipo: 'select', opciones: MEDIOS }] },
  'caja/arqueos': { titulo: 'Historial de arqueos', descripcion: 'Aperturas, cierres y diferencias de caja.', filtros: [] },
  'caja/medios-pago': { titulo: 'Distribución por medio de pago', descripcion: 'Participación de cada medio de pago en el período.', filtros: [...FECHAS, { campo: 'cajaId', etiqueta: 'ID caja', tipo: 'number', min: 1 }] },
};

@Component({ selector: 'app-reporte-detalle', standalone: true, imports: [CommonModule, FormsModule],
  template: `<section class="reporte">
    <p class="miga">Reportes › {{ areaNombre }}</p><h1>{{ config.titulo }}</h1><p class="descripcion">{{ config.descripcion }}</p>
    <form class="filtros" (ngSubmit)="consultar()" *ngIf="config.filtros.length">
      <label *ngFor="let filtro of config.filtros">{{ filtro.etiqueta }}
        <select *ngIf="filtro.tipo === 'select'" [(ngModel)]="filtros[filtro.campo]" [name]="filtro.campo"><option value="">Todos</option><option *ngFor="let op of filtro.opciones" [ngValue]="op.valor">{{ op.etiqueta }}</option></select>
        <input *ngIf="filtro.tipo !== 'select'" [type]="filtro.tipo || 'text'" [(ngModel)]="filtros[filtro.campo]" [name]="filtro.campo" [min]="filtro.min ?? null" [max]="filtro.max ?? null" />
      </label><button type="submit" [disabled]="cargando">{{ cargando ? 'Consultando…' : 'Consultar' }}</button><button type="button" class="secundario" (click)="limpiar()">Limpiar</button>
    </form>
    <div *ngIf="errorMensaje && !cargando" class="estado error">{{ errorMensaje }} <button type="button" (click)="consultar()">Reintentar</button></div>
    <div *ngIf="cargando" class="estado">Consultando reporte…</div><div *ngIf="consultado && !cargando && !errorMensaje && sinDatos" class="estado">Sin datos para los filtros seleccionados.</div>
    <ng-container *ngIf="datos && !cargando && !sinDatos">
      <div class="acciones"><button type="button" (click)="descargarPdf()" [disabled]="generandoPdf">{{ generandoPdf ? 'Generando PDF…' : 'Descargar PDF' }}</button></div>
      <div class="cards" *ngIf="tarjetas.length"><article *ngFor="let item of tarjetas"><small>{{ etiqueta(item[0]) }}</small><strong>{{ formatearCelda(item[0], item[1]) }}</strong></article></div>
      <div class="tabla" *ngIf="lista.length"><table><thead><tr><th *ngFor="let c of columnas">{{ etiqueta(c) }}</th></tr></thead><tbody><tr *ngFor="let fila of lista"><td *ngFor="let c of columnas">{{ formatearCelda(c, fila[c]) }}</td></tr></tbody></table></div>
      <div class="paginacion" *ngIf="config.paginado && totalPaginas > 1"><button (click)="cambiarPagina(-1)" [disabled]="pagina === 0">Anterior</button><span>Página {{ pagina + 1 }} de {{ totalPaginas }}</span><button (click)="cambiarPagina(1)" [disabled]="pagina + 1 >= totalPaginas">Siguiente</button></div>
    </ng-container>
  </section>`,
  styles: [`:host{display:block}.reporte{padding:26px 32px}.miga{color:#7955bb;font-weight:700}.reporte h1{margin:5px 0;color:#33204f}.descripcion{color:#766d84}.filtros{display:flex;flex-wrap:wrap;gap:12px;align-items:end;margin:20px 0;padding:16px;border:1px solid #e4ddec;border-radius:12px;background:#faf8fd}.filtros label{display:grid;gap:5px;min-width:145px;color:#5d526b;font-size:.78rem;font-weight:700}.filtros input,.filtros select,.filtros button,.paginacion button{min-height:38px;padding:8px 10px;border:1px solid #dcd3ea;border-radius:7px;background:#fff}.filtros button,.paginacion button,.acciones button,.estado button{padding:10px 15px;border:0;border-radius:8px;background:#60399b;color:#fff;font-weight:700;cursor:pointer}.filtros button.secundario{background:#fff;color:#60399b;border:1px solid #dcd3ea}.filtros button:disabled,.paginacion button:disabled,.acciones button:disabled{opacity:.45}.estado{padding:26px;border-radius:12px;background:#f6f3fb}.estado.error{display:flex;justify-content:space-between;align-items:center;gap:15px;background:#fff1f1;color:#9b2929}.acciones{display:flex;justify-content:flex-end;margin:18px 0}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin:20px 0}.cards article{padding:17px;border:1px solid #e4ddec;border-radius:12px;background:#fff}.cards small{display:block;margin-bottom:7px;color:#766d84}.cards strong{color:#43286b;font-size:1.18rem}.tabla{margin-top:20px;overflow:auto;border:1px solid #e4ddec;border-radius:14px;background:#fff}table{width:100%;border-collapse:collapse;white-space:nowrap}thead{background:#f2ecfa}th,td{padding:13px 15px;border-bottom:1px solid #eee8f4;text-align:left}th{color:#57378a;font-size:.72rem;text-transform:uppercase}td{color:#443c50;font-size:.86rem}tbody tr:hover{background:#fbf9fe}.paginacion{display:flex;justify-content:center;align-items:center;gap:14px;margin-top:18px}@media(max-width:700px){.reporte{padding:16px}.filtros label{width:100%}.filtros button{flex:1}.cards{grid-template-columns:repeat(2,1fr)}}`]
})
export class ReporteDetalleComponent implements OnInit {
  endpoint = ''; config: ConfigReporte = { titulo: 'Reporte', descripcion: '', filtros: [] }; areaNombre = '';
  filtros: FiltrosReporte = {}; datos: ResumenReporte | ResumenReporte[] | null = null; consultado = false; cargando = false; generandoPdf = false; errorMensaje = '';
  constructor(private route: ActivatedRoute, private service: ReportesService, private toast: ToastrService, private admin: AdministracionService) {}
  ngOnInit(): void { const { area, reporte } = this.route.snapshot.params; const reporteNormalizado = reporte === 'ranking' ? 'ranking-productos' : reporte; this.endpoint = `${area}/${reporteNormalizado}`; this.config = CONFIG[this.endpoint] ?? this.config; this.areaNombre = String(area).charAt(0).toUpperCase() + String(area).slice(1);
    this.filtros = { page: this.config.paginado ? 0 : undefined, size: this.config.paginado ? 50 : undefined, tipoRanking: this.endpoint === 'ventas/ranking-productos' ? 'MAS_VENDIDOS' : undefined, limit: this.endpoint === 'ventas/ranking-productos' ? 10 : undefined, diasSinVenta: this.endpoint === 'inventario/inmovilizado' ? 90 : undefined };
    if (this.endpoint !== 'proveedores/evolucion-costos') this.consultar(); }
  consultar(): void { if (this.endpoint === 'proveedores/evolucion-costos' && !this.filtros.productoId) { this.toast.info('Ingresá el ID del producto'); return; } this.cargando = true; this.consultado = true; this.errorMensaje = '';
    const pedido = this.endpoint === 'proveedores/evolucion-costos' ? this.service.getEvolucionCostos(Number(this.filtros.productoId)) : this.service.consultar(this.endpoint, this.filtros);
    pedido.subscribe({ next: datos => { this.datos = datos; this.cargando = false; }, error: e => { this.cargando = false; const mensaje = String(e.error?.error || e.error?.message || ''); this.errorMensaje = e.status === 403 ? 'No tenés permiso para ver este reporte. Cerrá sesión e ingresá nuevamente si tus permisos cambiaron.' : mensaje || `No se pudo consultar el reporte (HTTP ${e.status || 0}).`; this.toast.error(this.errorMensaje); } }); }
  limpiar(): void { this.filtros = { page: this.config.paginado ? 0 : undefined, size: this.config.paginado ? 50 : undefined }; this.datos = null; this.consultado = false; }
  cambiarPagina(delta: number): void { this.filtros.page = Math.max(0, this.pagina + delta); this.consultar(); }
  get pagina(): number { return Number((this.datos as ResumenReporte)?.['pagina'] ?? this.filtros.page ?? 0); }
  get totalPaginas(): number { return Number((this.datos as ResumenReporte)?.['totalPaginas'] ?? 0); }
  get lista(): ResumenReporte[] { if (Array.isArray(this.datos)) return this.datos; const d = this.datos as ResumenReporte | null; for (const clave of ['contenido','detalle','evolucion','historial']) if (Array.isArray(d?.[clave])) return d[clave] as ResumenReporte[]; if (d?.['movimientosPorMedioPago'] && typeof d['movimientosPorMedioPago'] === 'object') return Object.entries(d['movimientosPorMedioPago'] as object).map(([medioPago,total]) => ({ medioPago, total })); return []; }
  get columnas(): string[] { return this.lista.length ? Object.keys(this.lista[0]) : []; }
  get tarjetas(): Array<[string, unknown]> { if (!this.datos || Array.isArray(this.datos)) return []; const resumen = this.datos['resumen']; const origen = resumen && typeof resumen === 'object' ? resumen as ResumenReporte : this.datos; return Object.entries(origen).filter(([k,v]) => !['contenido','detalle','evolucion','historial','movimientosPorMedioPago','pagina','tamanio','totalPaginas'].includes(k) && ['string','number'].includes(typeof v)); }
  get sinDatos(): boolean { return !this.datos || (!this.lista.length && !this.tarjetas.length); }
  etiqueta(campo: string): string { return ETIQUETAS_CORTAS[campo] ?? campo.replace(/([A-Z])/g, ' $1').replaceAll('_',' ').replace(/^./, c => c.toUpperCase()); }
  formatearCelda(campo: string, valor: unknown): string { if (valor === null || valor === undefined || valor === '') return '-'; if (typeof valor === 'boolean') return valor ? 'Sí' : 'No'; const moneda = /total|venta|facturacion|costo|precio|ganancia|saldo|deuda|importe|pagado|capital|limite|disponible|iva|impuesto|monto|subtotal|retiro|aporte|ingreso|egreso|efectivo/i.test(campo); if (moneda && typeof valor === 'number') return new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS'}).format(valor); if (/porcentaje|margen/i.test(campo) && typeof valor === 'number') return `${new Intl.NumberFormat('es-AR',{maximumFractionDigits:2}).format(valor)} %`; if (typeof valor === 'number') return new Intl.NumberFormat('es-AR',{maximumFractionDigits:2}).format(valor); return String(valor).replaceAll('_',' '); }
  async descargarPdf(): Promise<void> {
    if (!this.datos || this.generandoPdf) return; this.generandoPdf = true;
    try {
      const [empresa, logo] = await Promise.all([firstValueFrom(this.admin.obtenerEmpresa()).catch(() => ({} as Empresa)), this.obtenerLogo()]);
      const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: this.columnas.length > 6 ? 'landscape' : 'portrait' }); const ancho = doc.internal.pageSize.getWidth();
      doc.setFillColor(64,46,114); doc.rect(0,0,ancho,35,'F'); if (logo) doc.addImage(logo,'PNG',12,6,23,23);
      doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(15); doc.text(empresa.nombreFantasia || empresa.name || CompanyDocumentConfig.tradeName, logo ? 40 : 13, 15);
      doc.setFontSize(13); doc.text(this.config.titulo, ancho - 13, 15, { align: 'right' }); doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.text(`Generado: ${new Date().toLocaleString('es-AR')}`, ancho - 13, 23, { align: 'right' });
      let inicio = 43;
      if (this.tarjetas.length) { autoTable(doc,{startY:inicio,head:[['Indicador','Valor']],body:this.tarjetas.map(([k,v]) => [this.etiqueta(k),this.formatearCelda(k,v)]),theme:'grid',headStyles:{fillColor:[96,57,155]}}); inicio = (doc as unknown as {lastAutoTable:{finalY:number}}).lastAutoTable.finalY + 8; }
      if (this.lista.length) autoTable(doc,{startY:inicio,head:[this.columnas.map(c => this.etiqueta(c))],body:this.lista.map(f => this.columnas.map(c => this.formatearCelda(c,f[c]))),theme:'striped',styles:{fontSize:7,cellPadding:2},headStyles:{fillColor:[96,57,155]},horizontalPageBreak:true});
      doc.save(`reporte-${this.endpoint.replace('/','-')}-${new Date().toISOString().slice(0,10)}.pdf`); this.toast.success('PDF generado correctamente.');
    } catch { this.toast.error('No se pudo generar el PDF.'); } finally { this.generandoPdf = false; }
  }
  private obtenerLogo(): Promise<string | null> { return firstValueFrom(this.admin.obtenerLogo()).then(blob => new Promise<string>((resolve,reject) => { const reader = new FileReader(); reader.onloadend = () => resolve(String(reader.result)); reader.onerror = () => reject(); reader.readAsDataURL(blob); })).catch(() => null); }
}
