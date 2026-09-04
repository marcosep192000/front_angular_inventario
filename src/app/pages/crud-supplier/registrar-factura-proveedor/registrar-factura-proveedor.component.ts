import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  MatDialog,
  MatDialogModule
} from '@angular/material/dialog';

import {
  ToastrModule,
  ToastrService
} from 'ngx-toastr';

import {
  FormFacturaDatosProveedorComponent
} from './form-factura-datos-proveedor/form-factura-datos-proveedor.component';

import {
  RegistrarDetalleFacturaProveedorComponent
} from './registrar-detalle-factura-proveedor/registrar-detalle-factura-proveedor.component';

import {
  SupplierPaymentService
} from '../../../services/supplier-payment.service';

import {
  SpinnerComponent
} from '../../../shared/spinner/spinner.component';

import {
  DialogGenericComponent
} from '../../../shared/genericsComponents/dialog-generic/dialog-generic.component';

import {
  ProductItemBuy
} from '../../../interfaces/ProductItemBuy';

import {
  ImpuestosFacturaComponent,
  ImpuestoFacturaProveedor
} from './impuestos-factura/impuestos-factura.component';


@Component({
  selector: 'app-registrar-factura-proveedor',

  standalone: true,

  imports: [

    CommonModule,

    FormFacturaDatosProveedorComponent,

    RegistrarDetalleFacturaProveedorComponent,

    ImpuestosFacturaComponent,

    ToastrModule,

    SpinnerComponent,

    MatDialogModule

  ],

  templateUrl:
    './registrar-factura-proveedor.component.html',

  styleUrl:
    './registrar-factura-proveedor.component.css'
})
export class RegistrarFacturaProveedorComponent
  implements OnInit {


  // =========================================================
  // REFERENCIAS
  // =========================================================

  @ViewChild('childRef')
  datosProveedorComponent!:
    FormFacturaDatosProveedorComponent;


  @ViewChild('childRefDetalle')
  datosDetallesProveedorComponent!:
    RegistrarDetalleFacturaProveedorComponent;


  @ViewChild(ImpuestosFacturaComponent)
  impuestosComponent?:
    ImpuestosFacturaComponent;


  // =========================================================
  // DATOS PROVEEDOR
  // =========================================================

  datosProveedor: any = null;


  // =========================================================
  // PRODUCTOS
  // =========================================================

  productos:
    ProductItemBuy[] = [];


  // =========================================================
  // IMPUESTOS
  // =========================================================

  impuestos:
    ImpuestoFacturaProveedor[] = [];


  impuestosTotal = 0;


  // =========================================================
  // TOTALES
  // =========================================================

  subtotalFactura = 0;

  totalIva = 0;

  totalFactura = 0;


  get totalCalculado(): number {

    return this.redondear(
      this.subtotalFactura +
      this.totalIva +
      this.impuestosTotal
    );

  }


  get totalFacturaFisica(): number | null {

    const monto = Number(
      this.datosProveedor?.montoTotal
    );

    return Number.isFinite(monto) && monto >= 0
      ? monto
      : null;

  }


  get ajusteRedondeo(): number {

    if (this.totalFacturaFisica === null) {
      return 0;
    }

    return this.redondear(
      this.totalFacturaFisica - this.totalCalculado
    );

  }

  get descuentoFacturaDetectado(): number {
    return this.ajusteRedondeo < -0.01 ? Math.abs(this.ajusteRedondeo) : 0;
  }

  get diferenciaFacturaPositiva(): number {
    return this.ajusteRedondeo > 0.01 ? this.ajusteRedondeo : 0;
  }

  get diferenciaEsRedondeo(): boolean {
    return Math.abs(this.ajusteRedondeo) <= 0.01;
  }


  // =========================================================
  // ESTADO
  // =========================================================

  showFormSubtotal = false;

  guardando = false;


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(

    private invoiceService:
      SupplierPaymentService,

    private toast:
      ToastrService,

    private dialog:
      MatDialog,

    private cdRef:
      ChangeDetectorRef

  ) {}


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    // Los datos llegan desde los componentes hijos.

  }


  // =========================================================
  // DATOS CABECERA
  // =========================================================

  datosHijo1Change(
    datos: any
  ): void {

    this.datosProveedor =
      datos;

    console.log(
      'Datos proveedor:',
      this.datosProveedor
    );

  }


  // =========================================================
  // PRODUCTOS
  // =========================================================

  datosHijo2Change(
    productos: ProductItemBuy[]
  ): void {

    this.productos =
      productos ?? [];


    this.showFormSubtotal =
      this.productos.length > 0;


    this.calcularTotales();


    console.log(
      'Productos:',
      this.productos
    );


    this.cdRef.detectChanges();

  }


  // =========================================================
  // IMPUESTOS
  // =========================================================

  datosImpuestosChange(
    impuestos: ImpuestoFacturaProveedor[]
  ): void {

    this.impuestos =
      impuestos ?? [];


    this.impuestosTotal =
      this.impuestos.reduce(

        (
          total,
          impuesto
        ) =>

          total +
          (
            Number(
              impuesto.importe
            ) || 0
          ),

        0

      );


    this.calcularTotales();


    this.cdRef.detectChanges();

  }


  // =========================================================
  // CALCULAR TOTALES
  // =========================================================

  private calcularTotales(): void {

    this.subtotalFactura = 0;

    this.totalIva = 0;


    // =======================================================
    // IMPUESTOS
    // =======================================================

    this.impuestosTotal =
      this.impuestos.reduce(

        (
          total,
          impuesto
        ) =>

          total +
          (
            Number(
              impuesto.importe
            ) || 0
          ),

        0

      );


    // =======================================================
    // PRODUCTOS
    // =======================================================

    for (
      const producto
      of this.productos
    ) {

      const cantidad =
        Number(
          producto.quantity
        ) || 0;


      /*
       * -----------------------------------------------------
       * PRECIO
       * -----------------------------------------------------
       *
       * Actualmente ProductItemBuy utiliza price.
       *
       * Si el hijo ya entrega el precio final después
       * de descuentos, usamos ese valor.
       *
       * Si además entrega descuentos, intentamos
       * calcularlos para evitar doble aplicación.
       */

      const precio =
        this.obtenerPrecioBase(
          producto
        );


      const subtotalLinea =
        precio *
        cantidad;


      // =====================================================
      // IVA
      // =====================================================

      const iva =
        Number(
          producto.iva
        ) || 0;


      const importeIva =
        (
          subtotalLinea *
          iva
        ) / 100;


      // =====================================================
      // ACUMULAR
      // =====================================================

      this.subtotalFactura +=
        subtotalLinea;


      this.totalIva +=
        importeIva;

    }


    // =======================================================
    // REDONDEAR
    // =======================================================

    this.subtotalFactura =
      this.redondear(
        this.subtotalFactura
      );


    this.totalIva =
      this.redondear(
        this.totalIva
      );


    this.impuestosTotal =
      this.redondear(
        this.impuestosTotal
      );


    // =======================================================
    // TOTAL FINAL
    // =======================================================

    this.totalFactura =
      this.totalCalculado;

  }


  // =========================================================
  // OBTENER PRECIO
  // =========================================================

  private obtenerPrecioBase(
    producto: ProductItemBuy
  ): number {

    const productoAny =
      producto as any;


    const precio =
      Number(
        productoAny.price
      ) || 0;


    /*
     * -------------------------------------------------------
     * DESCUENTOS
     * -------------------------------------------------------
     *
     * Si el componente de detalle ya entrega price
     * con descuentos aplicados, no volvemos a descontar.
     *
     * Por eso price sigue siendo la fuente principal.
     *
     * Los descuentos se conservan dentro del detalle
     * que se envía al backend.
     */

    return precio;

  }


  // =========================================================
  // REDONDEAR
  // =========================================================

  private redondear(
    valor: number
  ): number {

    return Math.round(

      (
        Number(valor) +
        Number.EPSILON
      ) * 100

    ) / 100;

  }


  // =========================================================
  // VALIDAR PROVEEDOR
  // =========================================================

  private validarDatosProveedor(): boolean {

    if (
      !this.datosProveedor
    ) {

      this.toast.error(
        'Debes completar los datos de la factura.'
      );

      return false;

    }


    if (

      !this.datosProveedor.idInvoice ||

      !this.datosProveedor.provider ||

      !this.datosProveedor.tipoDeCuentaEnum

    ) {

      this.toast.error(
        'Completa proveedor, comprobante y forma de pago.'
      );

      return false;

    }


    return true;

  }


  // =========================================================
  // VALIDAR PRODUCTOS
  // =========================================================

  private validarProductos(): boolean {

    if (
      !this.productos ||
      this.productos.length === 0
    ) {

      this.toast.error(
        'Debes agregar al menos un producto a la factura.'
      );

      return false;

    }


    return true;

  }


  // =========================================================
  // CREAR FACTURA - DIALOG
  // =========================================================

  crearFacturaDialog(): void {

    if (
      !this.validarDatosProveedor()
    ) {

      return;

    }


    if (
      !this.validarProductos()
    ) {

      return;

    }


    this.calcularTotales();


    const totalFacturaFisica =
      this.totalFacturaFisica;


    if (
      totalFacturaFisica === null ||
      totalFacturaFisica <= 0
    ) {

      this.toast.error(
        'Indicá el total impreso en la factura física.'
      );

      return;

    }


    this.dialog

      .open(
        DialogGenericComponent,
        {

          disableClose:
            true,

          autoFocus:
            true,

          hasBackdrop:
            true,

          closeOnNavigation:
            false,

          data: {

            component:
              '',

            data:
              'Crear Factura',

            state:
              'crear',

            icon:
              '',

            message:

              `Vas a registrar la factura por un total de ` +

              `${totalFacturaFisica.toLocaleString(
                'es-AR',
                {
                  style:
                    'currency',

                  currency:
                    'ARS'
                }
              )}. ¿Continuar?`

          }

        }

      )

      .afterClosed()

      .subscribe(
        resultado => {

          if (
            resultado === true
          ) {

            this.crearFactura();

          }

        }
      );

  }


  // =========================================================
  // CREAR FACTURA
  // =========================================================

  private crearFactura(): void {

    if (
      this.guardando
    ) {

      return;

    }


    if (
      !this.validarDatosProveedor()
    ) {

      return;

    }


    if (
      !this.validarProductos()
    ) {

      return;

    }


    // =======================================================
    // RECALCULAR
    // =======================================================

    this.calcularTotales();


    if (
      this.totalFacturaFisica === null ||
      this.totalFacturaFisica <= 0
    ) {

      this.toast.error(
        'El total de la factura debe ser mayor a cero.'
      );

      return;

    }


    // =======================================================
    // CONSTRUIR DETALLES
    // =======================================================

    const detalles =
      this.productos.map(
        producto => {

          const precio =
            Number(
              producto.price
            ) || 0;


          const cantidad =
            Number(
              producto.quantity
            ) || 0;


          const iva =
            Number(
              producto.iva
            ) || 0;


          const subtotal =
            precio *
            cantidad;


          const importeIva =
            (
              subtotal *
              iva
            ) / 100;


          const precioTotal =
            subtotal +
            importeIva;


          return {

            /*
             * Conservamos todos los datos
             * que ya entrega el componente hijo.
             */

            ...producto,


            price:
              precio,


            quantity:
              cantidad,


            iva:
              iva,


            tipoIva:
              producto.tipoIva ??
              this.obtenerTipoIva(
                iva
              ),


            totalStock:

              (
                Number(
                  producto.stock
                ) || 0
              ) + cantidad,


            precioTotal:

              this.redondear(
                precioTotal
              )

          };

        }
      );


    // =======================================================
    // IMPUESTOS
    // =======================================================

    const impuestosRequest =
      this.impuestos.map(
        impuesto => ({

          tipo:
            impuesto.tipo,

          descripcion:
            impuesto.descripcion,

          porcentaje:
            Number(
              impuesto.porcentaje
            ) || 0

        })
      );


    // =======================================================
    // FACTURA
    // =======================================================

    const factura = {

      // -----------------------------------------------------
      // CABECERA
      // -----------------------------------------------------

      idInvoice:
        this.datosProveedor.idInvoice,


      dateOfEntry:
        this.formatearFecha(
          this.datosProveedor.dateOfEntry
        ),


      dueDate:

        this.datosProveedor.dueDate

          ? this.formatearFecha(
              this.datosProveedor.dueDate
            )

          : null,


      payDay:
        null,


      provider:
        Number(
          this.datosProveedor.provider
        ),


      tipoDeCuentaEnum:
        this.datosProveedor.tipoDeCuentaEnum,


      payamentStatus:
        false,


      // -----------------------------------------------------
      // TOTALES
      // -----------------------------------------------------

      subtotalNeto:
        this.subtotalFactura,


      ivaTotal:
        this.totalIva,


      totalCalculado:
        this.totalCalculado,


      montoTotal:
        this.totalFacturaFisica,


      observacionRedondeo:
        this.ajusteRedondeo !== 0
          ? this.datosProveedor.observacionRedondeo?.trim() || null
          : null,


      /*
       * Compatibilidad con código anterior
       */

      amount:
        this.subtotalFactura,


      // -----------------------------------------------------
      // IMPUESTOS
      // -----------------------------------------------------

      impuestos:
        impuestosRequest,


      // -----------------------------------------------------
      // PRODUCTOS
      // -----------------------------------------------------

      invoiceDetailsProviders:
        detalles

    };


    // =======================================================
    // DEBUG
    // =======================================================

    console.log(
      '======================================'
    );


    console.log(
      'FACTURA A ENVIAR'
    );


    console.log(
      JSON.stringify(
        factura,
        null,
        2
      )
    );


    console.log(
      '======================================'
    );


    // =======================================================
    // GUARDAR
    // =======================================================

    this.guardando =
      true;


    this.invoiceService

      .createPaymentSupplier(
        factura as any
      )

      .subscribe({

        next:
          respuesta => {

            console.log(
              'Factura creada:',
              respuesta
            );


            this.toast.success(
              'Factura registrada correctamente.'
            );


            this.resetFormulario();


            this.guardando =
              false;

          },


        error:
          error => {

            console.error(
              'Error al registrar factura:',
              error
            );


            this.guardando =
              false;


            const mensaje =

              error?.error?.message ??

              'No se pudo registrar la factura.';


            this.toast.error(
              mensaje
            );

          }

      });

  }


  // =========================================================
  // FORMATEAR FECHA
  // =========================================================

  private formatearFecha(
    fecha: any
  ): string | null {

    if (
      !fecha
    ) {

      return null;

    }


    if (
      typeof fecha === 'string'
    ) {

      return fecha.includes('T')

        ? fecha.split('T')[0]

        : fecha;

    }


    if (
      fecha instanceof Date
    ) {

      const year =
        fecha.getFullYear();


      const month =
        String(
          fecha.getMonth() + 1
        ).padStart(
          2,
          '0'
        );


      const day =
        String(
          fecha.getDate()
        ).padStart(
          2,
          '0'
        );


      return `${year}-${month}-${day}`;

    }


    return null;

  }


  // =========================================================
  // RESET COMPLETO
  // =========================================================

  private resetFormulario(): void {

    this.datosProveedor =
      null;


    this.productos =
      [];


    this.impuestos =
      [];


    this.subtotalFactura =
      0;


    this.totalIva =
      0;


    this.impuestosTotal =
      0;


    this.totalFactura =
      0;


    this.showFormSubtotal =
      false;


    // =======================================================
    // RESET IMPUESTOS
    // =======================================================

    if (
      this.impuestosComponent
    ) {

      this.impuestosComponent.reset();

    }


    // =======================================================
    // RESET CABECERA
    // =======================================================

    if (
      this.datosProveedorComponent
    ) {

      this.datosProveedorComponent
        .resetDatosProveedor();

    }


    // =======================================================
    // RESET PRODUCTOS
    // =======================================================

    if (
      this.datosDetallesProveedorComponent
    ) {

      this.datosDetallesProveedorComponent
        .resetListaProductos();

    }


    this.cdRef.detectChanges();

  }


  // =========================================================
  // LIMPIAR TOTAL
  // =========================================================

  limpiarTotal(
    mostrar: boolean
  ): void {

    this.showFormSubtotal =
      mostrar;


    if (
      !mostrar
    ) {

      this.subtotalFactura =
        0;


      this.totalIva =
        0;


      this.impuestosTotal =
        0;


      this.totalFactura =
        0;


      this.impuestos =
        [];


      if (
        this.impuestosComponent
      ) {

        this.impuestosComponent.reset();

      }

    }

  }


  // =========================================================
  // OBTENER TIPO IVA
  // =========================================================

  private obtenerTipoIva(
    porcentaje: number
  ): string {

    switch (
      Number(porcentaje)
    ) {

      case 0:
        return 'IVA_0';


      case 2.5:
        return 'IVA_2_5';


      case 5:
        return 'IVA_5';


      case 10.5:
        return 'IVA_10_5';


      case 21:
        return 'IVA_21';


      case 27:
        return 'IVA_27';


      default:

        throw new Error(
          `Alícuota de IVA no válida: ${porcentaje}%`
        );

    }

  }

}
