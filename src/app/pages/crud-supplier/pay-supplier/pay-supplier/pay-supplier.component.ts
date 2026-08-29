import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, Optional } from '@angular/core';
import {
  VerPagosFacturaComponent
} from './ver-pagos-factura/ver-pagos-factura.component';
import { ReporteChequesProveedorComponent } from './reporte-cheques-proveedor/reporte-cheques-proveedor.component';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ToastrModule, ToastrService } from 'ngx-toastr';

import { Supplier } from '../../../../interfaces/supplier';

import { ChequeProveedor } from '../../../../interfaces/cheque-proveedor';

import {
  FacturaCuentaCorriente,
  CuentaCorrienteProveedor,
} from '../../../../interfaces/cuenta-corriente-proveedor';

import { FacturasProveedor } from '../../../../interfaces/facturasProveedor';

import { SupplierPaymentService } from '../../../../services/supplier-payment.service';

import { SupplierService } from '../../../../services/supplier.service';

import { VerDetalleFacturaComponent } from './ver-detalle-factura/ver-detalle-factura.component';

// =========================================================
// REQUEST PAGO
// =========================================================

interface PagoContadoRequest {
  formaDePago: string;

  medioPago: string;

  monto: number;

  proveedor: number;

  facturaCompra: number;

  descripcion: string;

  // -------------------------------------------------------
  // CHEQUE
  // -------------------------------------------------------

  numeroCheque?: string;

  banco?: string;

  titular?: string;

  quienEntrego?: string;

  nombreEntrega?: string;

  fechaEmision?: string;

  fechaCobro?: string;

  observacionCheque?: string;
}

// =========================================================
// COMPONENTE
// =========================================================

@Component({
  selector: 'app-pay-supplier',

  standalone: true,

  imports: [
    CommonModule,

    FormsModule,

    ReactiveFormsModule,

    MatDialogModule,

    MatButtonModule,

    MatFormFieldModule,

    MatInputModule,

    MatSelectModule,

    MatIconModule,

    MatTabsModule,

    MatTableModule,

    MatProgressSpinnerModule,

    MatTooltipModule,

    ToastrModule,
  ],

  templateUrl: './pay-supplier.component.html',

  styleUrl: './pay-supplier.component.css',
})
export class PaySupplierComponent implements OnInit {
  // =========================================================
  // PROVEEDOR
  // =========================================================

  supplier: Supplier | null = null;

  proveedorId = 0;

  // =========================================================
  // FACTURAS
  // =========================================================

  facturas: FacturasProveedor[] = [];

  facturasCuentaCorriente: FacturaCuentaCorriente[] = [];

  facturaSeleccionada: FacturasProveedor | FacturaCuentaCorriente | null = null;

  // =========================================================
  // CUENTA CORRIENTE
  // =========================================================

  cuentaCorriente: CuentaCorrienteProveedor | null = null;

  saldoCuentaCorriente = 0;

  totalFacturado = 0;

  totalPagado = 0;

  totalPendiente = 0;

  // =========================================================
  // CHEQUES
  // =========================================================

  cheques: ChequeProveedor[] = [];

  // =========================================================
  // FORMULARIO DE PAGO
  // =========================================================

  formPago!: FormGroup;

  mostrarFormularioPago = false;

  mostrarDatosCheque = false;

  procesandoPago = false;

  // =========================================================
  // ESTADOS
  // =========================================================

  loadingFacturas = false;

  loadingCuenta = false;

  loadingCheques = false;

  errorFacturas = false;

  errorCuenta = false;

  errorCheques = false;

  // =========================================================
  // TAB
  // =========================================================

  tabSeleccionada = 0;

  // =========================================================
  // DIALOG
  // IMPORTANTE:
  // PUBLIC porque el template lo utiliza
  // =========================================================

  public readonly dialogRef: MatDialogRef<PaySupplierComponent> | null;

  // =========================================================
  // COLUMNAS FACTURAS
  // =========================================================

  columnasFacturas = [
    'numero',

    'fecha',

    'tipo',

    'total',

    'pagado',

    'saldo',

    'estado',

    'acciones',
  ];

  // =========================================================
  // COLUMNAS CHEQUES
  // =========================================================

  columnasCheques = [
    'numero',

    'banco',

    'titular',

    'monto',

    'emision',

    'cobro',

    'estado',

    'acciones',
  ];

  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private supplierPaymentService: SupplierPaymentService,

    private supplierService: SupplierService,

    private fb: FormBuilder,

    private toastr: ToastrService,

    private dialog: MatDialog,

    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data: any,

    @Optional()
    dialogRef: MatDialogRef<PaySupplierComponent> | null,
  ) {
    this.dialogRef = dialogRef;
  }

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    console.log('========== PAY SUPPLIER ==========');

    console.log('Datos recibidos:', this.data);

    this.inicializarFormulario();

    this.obtenerProveedor();
  }



  // =========================================================
// VER HISTORIAL DE PAGOS
// =========================================================

verPagosFactura(
  factura: FacturasProveedor | FacturaCuentaCorriente
): void {

  const facturaId =
    this.obtenerIdFactura(factura);

  if (!facturaId) {

    this.toastr.error(
      'La factura no tiene un ID válido.'
    );

    return;
  }

  this.dialog.open(
    VerPagosFacturaComponent,
    {
      width: '1050px',

      maxWidth: '95vw',

      maxHeight: '90vh',

      autoFocus: false,

      data: {
        facturaId,
        factura
      }
    }
  );
}

  // =========================================================
  // OBTENER PROVEEDOR
  // =========================================================

  private obtenerProveedor(): void {
    const id =
      this.data?.proveedorId ??
      this.data?.supplierId ??
      this.data?.id ??
      this.data?.supplier?.id;

    if (!id) {
      console.error('No se recibió ID de proveedor.');

      this.toastr.error('No se pudo identificar el proveedor.');

      return;
    }

    this.proveedorId = Number(id);

    this.supplier = this.data?.supplier ?? null;

    if (!this.supplier) {
      this.supplierService.findById(this.proveedorId).subscribe({
        next: (supplier: Supplier) => {
          this.supplier = supplier;

          this.cargarDatosProveedor();
        },

        error: (error) => {
          console.error('Error obteniendo proveedor:', error);

          this.cargarDatosProveedor();
        },
      });
    } else {
      this.cargarDatosProveedor();
    }
  }

  // =========================================================
  // TIPO DE CUENTA
  // =========================================================

  esFacturaContado(factura: FacturasProveedor | any): boolean {
    const tipo = String(factura?.tipoDeCuentaEnum ?? factura?.tipoCuenta ?? '')
      .trim()
      .toUpperCase();

    return tipo === '' || tipo === 'CONTADO';
  }

  esFacturaCuentaCorriente(
    factura: FacturasProveedor | FacturaCuentaCorriente | any,
  ): boolean {
    const tipo = String(factura?.tipoDeCuentaEnum ?? factura?.tipoCuenta ?? '')
      .trim()
      .toUpperCase();

    return (
      tipo === 'CTA_CTE' ||
      tipo === 'CUENTA_CORRIENTE' ||
      tipo === 'CUENTA CORRIENTE'
    );
  }

  // =========================================================
  // CARGAR DATOS DEL PROVEEDOR
  // =========================================================

  private cargarDatosProveedor(): void {
    this.cargarFacturas();

    this.cargarCuentaCorriente();

    this.cargarCheques();
  }

  // =========================================================
  // FACTURAS
  // =========================================================

  cargarFacturas(): void {
    if (!this.proveedorId) {
      return;
    }

    this.loadingFacturas = true;

    this.errorFacturas = false;

    this.supplierPaymentService
      .getAllFacturasProveedor(this.proveedorId)
      .subscribe({
        next: (facturas: FacturasProveedor[]) => {
          const todasLasFacturas = Array.isArray(facturas) ? facturas : [];

          // FACTURAS: solamente CONTADO.
          // CTA_CTE se administra en Cuenta Corriente.
          this.facturas = todasLasFacturas.filter((factura) =>
            this.esFacturaContado(factura),
          );

          console.log('Facturas proveedor:', this.facturas);

          this.calcularTotalesFacturas();

          this.loadingFacturas = false;
        },

        error: (error) => {
          console.error('Error cargando facturas:', error);

          this.facturas = [];

          this.loadingFacturas = false;

          this.errorFacturas = true;
        },
      });
  }

  // =========================================================
  // TOTALES FACTURAS
  // =========================================================

  private calcularTotalesFacturas(): void {
    this.totalFacturado = this.facturas.reduce(
      (total: number, factura: FacturasProveedor) =>
        total + this.obtenerTotalFactura(factura),

      0,
    );

    this.totalPagado = this.facturas.reduce(
      (total: number, factura: FacturasProveedor) => {
        const pagado =
          this.obtenerTotalFactura(factura) -
          this.obtenerSaldoFactura(factura);

        return total + Math.max(0, pagado);
      },

      0,
    );

    this.totalPendiente = this.facturas.reduce(
      (total: number, factura: FacturasProveedor) =>
        total + this.obtenerSaldoFactura(factura),

      0,
    );
  }

  // =========================================================
  // CUENTA CORRIENTE
  // =========================================================

  cargarCuentaCorriente(): void {
    if (!this.proveedorId) {
      return;
    }

    this.loadingCuenta = true;

    this.errorCuenta = false;

    this.supplierPaymentService
      .getCuentaCorrienteProveedor(this.proveedorId)
      .subscribe({
        next: (cuenta: CuentaCorrienteProveedor) => {
          this.cuentaCorriente = cuenta;

          console.log('Cuenta corriente:', cuenta);

          this.procesarCuentaCorriente();

          this.loadingCuenta = false;
        },

        error: (error) => {
          console.error('Error cuenta corriente:', error);

          this.cuentaCorriente = null;

          this.saldoCuentaCorriente = 0;

          this.facturasCuentaCorriente = [];

          this.loadingCuenta = false;

          this.errorCuenta = true;
        },
      });
  }

  // =========================================================
  // PROCESAR CUENTA CORRIENTE
  // =========================================================

  private procesarCuentaCorriente(): void {
    if (!this.cuentaCorriente) {
      return;
    }

    this.saldoCuentaCorriente = this.obtenerNumero(
      this.cuentaCorriente.saldoPendiente,
    );

    this.facturasCuentaCorriente = Array.isArray(this.cuentaCorriente.facturas)
      ? this.cuentaCorriente.facturas
      : [];

    this.totalFacturado = this.obtenerNumero(
      this.cuentaCorriente.totalFacturado,
    );

    this.totalPagado = this.obtenerNumero(this.cuentaCorriente.totalPagado);

    this.totalPendiente = this.obtenerNumero(
      this.cuentaCorriente.saldoPendiente,
    );
  }

  // =========================================================
  // CUENTA CORRIENTE POR FECHA
  // =========================================================

  cargarCuentaPorFecha(desde: string, hasta: string): void {
    if (!this.proveedorId) {
      return;
    }

    this.loadingCuenta = true;

    this.supplierPaymentService
      .getCuentaCorrienteProveedorPorFecha(
        this.proveedorId,

        desde,

        hasta,
      )
      .subscribe({
        next: (cuenta: CuentaCorrienteProveedor) => {
          this.cuentaCorriente = cuenta;

          this.procesarCuentaCorriente();

          this.loadingCuenta = false;
        },

        error: (error) => {
          console.error('Error cuenta corriente por fecha:', error);

          this.loadingCuenta = false;
        },
      });
  }

  // =========================================================
  // CHEQUES
  // =========================================================

  cargarCheques(): void {
    if (!this.proveedorId) {
      return;
    }

    this.loadingCheques = true;

    this.errorCheques = false;

    this.supplierPaymentService
      .getChequesPendientesProveedor(this.proveedorId)
      .subscribe({
        next: (cheques: ChequeProveedor[]) => {
          this.cheques = Array.isArray(cheques) ? cheques : [];

          console.log('Cheques:', this.cheques);

          this.loadingCheques = false;
        },

        error: (error) => {
          console.error('Error cargando cheques:', error);

          this.cheques = [];

          this.loadingCheques = false;

          this.errorCheques = true;
        },
      });
  }

  verReporteCheques(): void {
    if (!this.proveedorId) {
      this.toastr.error('No se pudo identificar el proveedor.');

      return;
    }

    this.dialog.open(ReporteChequesProveedorComponent, {
      width: '1200px',
      maxWidth: '96vw',
      maxHeight: '92vh',
      autoFocus: false,
      data: {
        proveedorId: this.proveedorId,
        proveedorNombre: this.supplier?.name ?? 'Proveedor',
      },
    });
  }

  // =========================================================
  // VER DETALLE DE FACTURA
  // =========================================================

  verDetalleFactura(factura: FacturasProveedor | FacturaCuentaCorriente): void {
    const facturaId = this.obtenerIdFactura(factura);

    if (!facturaId) {
      this.toastr.error('La factura no tiene un ID válido.');

      return;
    }

    this.dialog.open(VerDetalleFacturaComponent, {
      width: '1100px',

      maxWidth: '95vw',

      maxHeight: '90vh',

      autoFocus: false,

      panelClass: 'detalle-factura-dialog',

      data: {
        factura,

        facturaId,

        updateSupplier: facturaId,
      },
    });
  }

  // =========================================================
  // SELECCIONAR FACTURA PARA PAGAR
  // =========================================================

  pagarFactura(factura: FacturasProveedor): void {
    const facturaId = this.obtenerIdFactura(factura);

    if (!facturaId) {
      this.toastr.error('No se pudo identificar la factura.');

      return;
    }

    const saldo = this.obtenerSaldoFactura(factura);

    if (saldo <= 0) {
      this.toastr.info('Esta factura ya está pagada.');

      return;
    }

    this.facturaSeleccionada = factura;

    this.mostrarFormularioPago = true;

    this.formPago.patchValue({
      facturaCompra: facturaId,

      proveedor: this.proveedorId,

      monto: saldo,

      medioPago: 'EFECTIVO',
    });

    this.mostrarDatosCheque = false;

    this.tabSeleccionada = 0;

    window.setTimeout(() => {
      const elemento = document.getElementById('formulario-pago-proveedor');

      elemento?.scrollIntoView({
        behavior: 'smooth',

        block: 'start',
      });
    });
  }

  // =========================================================
  // PAGAR FACTURA DE CUENTA CORRIENTE
  // =========================================================

  pagarFacturaCuentaCorriente(factura: FacturaCuentaCorriente): void {
    const facturaId = this.obtenerIdFactura(factura);

    if (!facturaId) {
      this.toastr.error('No se pudo identificar la factura.');

      return;
    }

    const saldo = this.obtenerSaldoFactura(factura);

    if (saldo <= 0) {
      this.toastr.info('Esta factura ya está pagada.');

      return;
    }

    this.facturaSeleccionada = factura;

    this.mostrarFormularioPago = true;

    // La factura ya es CTA_CTE.
    // Al pagarla solamente elegimos el medio de pago.
    this.formPago.patchValue({
      facturaCompra: facturaId,

      proveedor: this.proveedorId,

      monto: saldo,

      medioPago: 'EFECTIVO',
    });

    this.mostrarDatosCheque = false;

    this.tabSeleccionada = 1;

    window.setTimeout(() => {
      document.getElementById('formulario-pago-proveedor')?.scrollIntoView({
        behavior: 'smooth',

        block: 'start',
      });
    });
  }

  // =========================================================
  // FORMULARIO
  // =========================================================

  private inicializarFormulario(): void {
    this.formPago = this.fb.group({
      medioPago: ['EFECTIVO', Validators.required],

      monto: [0, [Validators.required, Validators.min(0.01)]],

      proveedor: [0, Validators.required],

      facturaCompra: [0, Validators.required],

      descripcion: [''],

      numeroCheque: [''],

      banco: [''],

      titular: [''],

      quienEntrego: [''],

      nombreEntrega: [''],

      fechaEmision: [''],

      fechaCobro: [''],

      observacionCheque: [''],
    });

    this.formPago.get('medioPago')?.valueChanges.subscribe((medio) => {
      this.mostrarDatosCheque = medio === 'CHEQUE';

      this.configurarValidacionesCheque();
    });

    this.configurarValidacionesCheque();
  }

  // =========================================================
  // VALIDACIONES CHEQUE
  // =========================================================

  private configurarValidacionesCheque(): void {
    const campos = [
      'numeroCheque',

      'banco',

      'titular',

      'quienEntrego',

      'nombreEntrega',

      'fechaEmision',

      'fechaCobro',
    ];

    const esCheque = this.formPago?.get('medioPago')?.value === 'CHEQUE';

    campos.forEach((campo) => {
      const control = this.formPago.get(campo);

      if (!control) {
        return;
      }

      if (esCheque) {
        control.setValidators([Validators.required]);
      } else {
        control.clearValidators();
      }

      control.updateValueAndValidity({
        emitEvent: false,
      });
    });
  }

  // =========================================================
  // REGISTRAR PAGO
  // =========================================================

  registrarPago(): void {
    if (this.formPago.invalid) {
      this.formPago.markAllAsTouched();

      this.toastr.error('Completá los datos obligatorios del pago.');

      return;
    }

    if (!this.facturaSeleccionada) {
      this.toastr.error('Seleccioná una factura.');

      return;
    }

    const request = this.construirRequestPago();

    console.log('========== PAGO PROVEEDOR ==========');

    console.log(request);

    this.procesandoPago = true;

    this.supplierPaymentService.registrarPagoProveedor(request).subscribe({
      next: () => {
        this.procesandoPago = false;

        this.toastr.success('Pago registrado correctamente.');

        this.cancelarPago();

        this.cargarFacturas();

        this.cargarCuentaCorriente();

        this.cargarCheques();
      },

      error: (error) => {
        this.procesandoPago = false;

        console.error('Error registrando pago:', error);

        this.toastr.error(
          error?.error?.message ?? 'No fue posible registrar el pago puedes No tener Saldo en Caja.',
        );
      },
    });
  }

  // =========================================================
  // CONSTRUIR REQUEST
  // =========================================================

  private construirRequestPago(): PagoContadoRequest {
    const value = this.formPago.getRawValue();

    const request: PagoContadoRequest = {
      formaDePago: 'CONTADO',

      medioPago: value.medioPago,

      monto: Number(value.monto),

      proveedor: Number(value.proveedor),

      facturaCompra: Number(value.facturaCompra),

      descripcion: value.descripcion ?? '',
    };

    // -------------------------------------------------------
    // DATOS DEL CHEQUE
    // -------------------------------------------------------

    if (value.medioPago === 'CHEQUE') {
      request.numeroCheque = value.numeroCheque;

      request.banco = value.banco;

      request.titular = value.titular;

      request.quienEntrego = value.quienEntrego;

      request.nombreEntrega = value.nombreEntrega;

      request.fechaEmision = value.fechaEmision;

      request.fechaCobro = value.fechaCobro;

      request.observacionCheque = value.observacionCheque;
    }

    return request;
  }

  // =========================================================
  // CANCELAR PAGO
  // =========================================================

  cancelarPago(): void {
    this.facturaSeleccionada = null;

    this.mostrarFormularioPago = false;

    this.mostrarDatosCheque = false;

    this.formPago.reset({
      medioPago: 'EFECTIVO',

      monto: 0,

      proveedor: this.proveedorId,

      facturaCompra: 0,

      descripcion: '',

      numeroCheque: '',

      banco: '',

      titular: '',

      quienEntrego: '',

      nombreEntrega: '',

      fechaEmision: '',

      fechaCobro: '',

      observacionCheque: '',
    });
  }

  // =========================================================
  // COBRAR CHEQUE
  // =========================================================

  cobrarCheque(cheque: ChequeProveedor): void {
    const id = this.obtenerIdCheque(cheque);
    const facturaId = this.obtenerNumero(cheque?.facturaId);

    if (!id) {
      this.toastr.error('El cheque no tiene un ID válido.');

      return;
    }

    if (!facturaId) {
      this.toastr.error('El cheque no tiene una factura asociada válida.');

      return;
    }

    if (!confirm('¿Confirmás que querés cobrar este cheque?')) {
      return;
    }

    this.supplierPaymentService.cobrarCheque(facturaId, id).subscribe({
      next: () => {
        this.toastr.success('Cheque cobrado correctamente.');

        this.cargarCheques();

        this.cargarCuentaCorriente();

        this.cargarFacturas();
      },

      error: (error) => {
        console.error('Error cobrando cheque:', error);

        this.toastr.error(
          error?.error?.message ?? 'No fue posible cobrar el cheque, puedes No tener Saldo en Caja o Caja cerrada.',
        );
      },
    });
  }

  // =========================================================
  // RECHAZAR CHEQUE
  // =========================================================

  rechazarCheque(cheque: ChequeProveedor): void {
    const id = this.obtenerIdCheque(cheque);
    const facturaId = this.obtenerNumero(cheque?.facturaId);

    if (!id) {
      this.toastr.error('El cheque no tiene un ID válido.');

      return;
    }

    if (!facturaId) {
      this.toastr.error('El cheque no tiene una factura asociada válida.');

      return;
    }

    if (!confirm('¿Confirmás que querés rechazar este cheque?')) {
      return;
    }

    this.supplierPaymentService.rechazarCheque(facturaId, id).subscribe({
      next: () => {
        this.toastr.success('Cheque rechazado correctamente.');

        this.cargarCheques();

        this.cargarCuentaCorriente();

        this.cargarFacturas();
      },

      error: (error) => {
        console.error('Error rechazando cheque:', error);

        this.toastr.error(
          error?.error?.message ?? 'No fue posible rechazar el cheque.',
        );
      },
    });
  }






  // =========================================================pppppppppppppppppppppppppppppppppppppppppppppppp


// =========================================================
// NÚMERO DE FACTURA
// =========================================================




// =========================================================
// FECHA DE FACTURA
// =========================================================


// =========================================================
// TOTAL DE FACTURA
// =========================================================

obtenerTotalFactura(
  factura:
    | FacturasProveedor
    | FacturaCuentaCorriente
    | null
): number {

  if (!factura) {
    return 0;
  }

  if ('montoTotalDecimal' in factura && factura.montoTotalDecimal != null) {
    return Number(factura.montoTotalDecimal) || 0;
  }

  if ('montoTotal' in factura) {
    return Number(factura.montoTotal) || 0;
  }

  if ('total' in factura) {
    return Number(factura.total) || 0;
  }

  return 0;
}









  // =========================================================ppppppppppppppppppppppppppppppppppppppppppppppppp














// =========================================================
// FECHA DE FACTURA
// =========================================================

obtenerFechaFactura(
  factura:
    | FacturasProveedor
    | FacturaCuentaCorriente
    | null
): string | null {

  if (!factura) {
    return null;
  }

  if ('dateOfEntry' in factura) {
    return factura.dateOfEntry;
  }

  if ('fecha' in factura) {
    return factura.fecha;
  }

  return null;
}
  // =========================================================
  // UTILIDAD: NÚMERO
  // =========================================================

  obtenerNumero(valor: unknown): number {
    const numero = Number(valor);

    return Number.isFinite(numero) ? numero : 0;
  }
// =========================================================
// NÚMERO DE FACTURA
// =========================================================

obtenerNumeroFactura(
  factura:
    | FacturasProveedor
    | FacturaCuentaCorriente
    | null
): string {

  if (!factura) {
    return '-';
  }

  if ('idInvoice' in factura) {
    return factura.idInvoice || '-';
  }

  if ('numeroFactura' in factura) {
    return factura.numeroFactura || '-';
  }

  return '-';
}
  // =========================================================
  // ID FACTURA
  // =========================================================

  obtenerIdFactura(
    factura: FacturasProveedor | FacturaCuentaCorriente | any,
  ): number {
    if (!factura) {
      return 0;
    }

    // -------------------------------------------------------
    // FacturasProveedor
    // -------------------------------------------------------

    if (factura.id !== undefined && factura.id !== null) {
      return this.obtenerNumero(factura.id);
    }

    // -------------------------------------------------------
    // FacturaCuentaCorriente
    // -------------------------------------------------------

    if (factura.facturaId !== undefined && factura.facturaId !== null) {
      return this.obtenerNumero(factura.facturaId);
    }

    return this.obtenerNumero(factura.invoiceId);
  }

  // =========================================================
  // SALDO FACTURA
  // =========================================================

  obtenerSaldoFactura(
    factura: FacturasProveedor | FacturaCuentaCorriente | any,
  ): number {
    if (!factura) {
      return 0;
    }

    // -------------------------------------------------------
    // FacturasProveedor
    // -------------------------------------------------------

    if (
      factura.saldoPendiente !== undefined &&
      factura.saldoPendiente !== null
    ) {
      return Math.max(
        0,

        this.obtenerNumero(factura.saldoPendiente),
      );
    }

    // -------------------------------------------------------
    // FacturaCuentaCorriente
    // -------------------------------------------------------

    if (factura.saldo !== undefined && factura.saldo !== null) {
      return Math.max(
        0,

        this.obtenerNumero(factura.saldo),
      );
    }

    const total = this.obtenerNumero(
      factura.montoTotalDecimal ?? factura.montoTotal ?? factura.total ?? factura.amount,
    );

    const pagado = this.obtenerNumero(factura.totalPagado);

    return Math.max(
      0,

      total - pagado,
    );
  }

  // =========================================================
  // ESTADO FACTURA
  // =========================================================

  obtenerEstadoFactura(
    factura: FacturasProveedor | FacturaCuentaCorriente | any,
  ): string {
    if (factura?.estado) {
      return factura.estado;
    }

    if (factura?.payamentStatus === true) {
      return 'PAGADA';
    }

    const saldo = this.obtenerSaldoFactura(factura);

    const total = this.obtenerNumero(
      factura?.montoTotalDecimal ?? factura?.montoTotal ?? factura?.total ?? factura?.amount,
    );

    if (saldo <= 0) {
      return 'PAGADA';
    }

    if (saldo < total) {
      return 'PARCIAL';
    }

    return 'PENDIENTE';
  }

  // =========================================================
  // TIPO DE CUENTA
  // =========================================================

  obtenerTipoCuenta(
    factura: FacturasProveedor | FacturaCuentaCorriente | any,
  ): string {
    return factura?.tipoDeCuentaEnum ?? factura?.tipoCuenta ?? 'CONTADO';
  }

  // =========================================================
  // ID CHEQUE
  // =========================================================

  obtenerIdCheque(cheque: ChequeProveedor): number {
    return this.obtenerNumero(cheque?.id);
  }

  // =========================================================
  // CERRAR
  // =========================================================

  cerrar(): void {
    this.dialogRef?.close();
  }
}
