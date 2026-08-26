import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';

import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder
} from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  MatDialog,
  MatDialogModule
} from '@angular/material/dialog';

import { MatOption } from '@angular/material/core';
import {
  MatFormField,
  MatLabel
} from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';

import {
  Subject,
  of
} from 'rxjs';

import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError
} from 'rxjs/operators';

import { ToastrService } from 'ngx-toastr';

import jsPDF from 'jspdf';

import { ProductService } from '../../../services/product.service';
import { ProductItemSale } from '../../../interfaces/ProductItemSale';
import { Client } from '../../../interfaces/Client';

import { CommonSaleService } from '../../../services/common-sale.service';
import { CtaCteService } from '../../../services/cta-cte.service';
import { ClientService } from '../../../services/client.service';

import { TotalSaleComponent } from '../total-sale/total-sale.component';

import {
  registrarDeudaCtaCteCliente
} from '../../../interfaces/registrarDeudaCtaCteCliente';

import { SaleCommon } from '../../../interfaces/sale-common';

import {
  SearchClientByDniComponent
} from '../../crud-client/search-client-by-dni/search-client-by-dni.component';

import { IconComponent } from '../../../shared/dasboard/icon/icon.component';



import {
  ConfirmDocumentComponent,
  ConfirmDocumentData
} from '../confirm-document/confirm-document.component';


@Component({
  selector: 'app-new-sale',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MatButtonModule,
    MatIconModule,
    MatDialogModule,

    IconComponent,

    MatOption,
    MatFormField,
    MatLabel,
    MatSelect
  ],

  templateUrl: './new-sale.component.html',

  styleUrl: './new-sale.component.css'
})
export class NewSaleComponent implements OnInit {

  // =====================================================
  // CLIENTES
  // =====================================================

  clients = new Array<Client>();

  buscarClienteIdCuentaCorriente: any;

  selectedClient: any;


  // =====================================================
  // DOCUMENTO
  // =====================================================

  tipoDocumento: string = 'FACTURA_C';

  condicionVenta: string = 'CONTADO';

  medioPago: string | null = 'EFECTIVO';


  // =====================================================
  // PRODUCTOS
  // =====================================================

  products = new Array<ProductItemSale>();

  code: string = '';

  product?: ProductItemSale;

  errorMessage?: string;


  // =====================================================
  // BUSCADOR
  // =====================================================

  private busquedaProducto$ =
    new Subject<string>();

  productosEncontrados: ProductItemSale[] = [];

  mostrarResultados = false;

  buscandoProductos = false;

  indiceSeleccionado = -1;


  // =====================================================
  // INPUT BUSCADOR
  // =====================================================

  @ViewChild('buscadorProducto')
  buscadorProducto?: ElementRef<HTMLInputElement>;


  // =====================================================
  // VENTA
  // =====================================================

  saleCommon?: SaleCommon;

  today: Date = new Date();


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    fb: FormBuilder,

    private productService: ProductService,

    private toastr: ToastrService,

    public dialog: MatDialog,

    private commonSale: CommonSaleService,

    private ctaCteService: CtaCteService,

    private clienteService: ClientService

  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.inicializarBuscador();

  }


  // =====================================================
  // INICIALIZAR BUSCADOR
  // =====================================================

  private inicializarBuscador(): void {

    this.busquedaProducto$

      .pipe(

        debounceTime(300),

        distinctUntilChanged(),

        switchMap((query: string) => {

          const texto =
            query.trim();


          // =============================================
          // BUSCADOR VACÍO
          // =============================================

          if (!texto) {

            this.productosEncontrados = [];

            this.mostrarResultados = false;

            this.buscandoProductos = false;

            return of([]);

          }


          // =============================================
          // BUSCANDO
          // =============================================

          this.buscandoProductos = true;

          return this.productService

            .searchForSale(texto)

            .pipe(

              catchError((error: any) => {

                console.error(
                  'Error buscando productos:',
                  error
                );

                this.toastr.error(
                  'No se pudieron buscar los productos.'
                );

                return of([]);

              })

            );

        })

      )

      .subscribe((productos) => {

        this.productosEncontrados =
          productos;

        this.mostrarResultados =
          productos.length > 0;

        this.buscandoProductos =
          false;

        this.indiceSeleccionado =
          -1;

      });

  }


  // =====================================================
  // CAMBIO DEL INPUT
  // =====================================================

  buscarProductos(texto: string): void {

    this.busquedaProducto$.next(texto);

  }


  // =====================================================
  // TECLADO BUSCADOR
  // =====================================================

  manejarTeclado(
    event: KeyboardEvent
  ): void {

    // =============================================
    // ESC
    // =============================================

    if (event.key === 'Escape') {

      event.preventDefault();

      this.mostrarResultados = false;

      this.indiceSeleccionado = -1;

      return;

    }


    // =============================================
    // ENTER
    // =============================================

    if (event.key === 'Enter') {

      event.preventDefault();

      const query =
        this.code.trim();


      // =============================================
      // SI ESTÁ BUSCANDO
      // =============================================

      if (this.buscandoProductos) {

        return;

      }


      // =============================================
      // SI HAY RESULTADOS
      // =============================================

      if (
        this.productosEncontrados.length > 0
      ) {

        const indice =
          this.indiceSeleccionado >= 0
            ? this.indiceSeleccionado
            : 0;

        const producto =
          this.productosEncontrados[indice];

        if (producto) {

          this.seleccionarProducto(
            producto
          );

        }

        return;

      }


      // =============================================
      // SIN RESULTADOS
      // =============================================

      if (query) {

        this.toastr.warning(
          'No se encontró ningún producto.'
        );

      }

      return;

    }


    // =============================================
    // SI NO HAY RESULTADOS
    // =============================================

    if (
      !this.mostrarResultados ||
      this.productosEncontrados.length === 0
    ) {

      return;

    }


    // =============================================
    // FLECHA ABAJO
    // =============================================

    if (event.key === 'ArrowDown') {

      event.preventDefault();

      if (
        this.indiceSeleccionado <
        this.productosEncontrados.length - 1
      ) {

        this.indiceSeleccionado++;

      } else {

        this.indiceSeleccionado = 0;

      }

      return;

    }


    // =============================================
    // FLECHA ARRIBA
    // =============================================

    if (event.key === 'ArrowUp') {

      event.preventDefault();

      if (
        this.indiceSeleccionado > 0
      ) {

        this.indiceSeleccionado--;

      } else {

        this.indiceSeleccionado =
          this.productosEncontrados.length - 1;

      }

      return;

    }

  }


  // =====================================================
  // SELECCIONAR PRODUCTO
  // =====================================================

  seleccionarProducto(
    producto: ProductItemSale
  ): void {

    this.agregarProducto(producto);

    this.code = '';

    this.productosEncontrados = [];

    this.mostrarResultados = false;

    this.indiceSeleccionado = -1;


    // =============================================
    // VOLVER AL BUSCADOR
    // =============================================

    setTimeout(() => {

      this.buscadorProducto
        ?.nativeElement
        .focus();

    });

  }


  // =====================================================
  // AGREGAR PRODUCTO
  // =====================================================

  private agregarProducto(
    data: ProductItemSale
  ): void {

    // =============================================
    // CONTROL STOCK
    // =============================================

    if (data.stock <= 0) {

      this.toastr.warning(
        `El producto "${data.name}" no tiene stock disponible.`
      );

      return;

    }


    // =============================================
    // BUSCAR EXISTENTE
    // =============================================

    const existingProduct =
      this.products.find(
        (product) =>
          product.id === data.id
      );


    // =============================================
    // PRODUCTO EXISTENTE
    // =============================================

    if (existingProduct) {

      if (
        existingProduct.quantity <
        existingProduct.stock
      ) {

        existingProduct.quantity += 1;

        this.toastr.success(
          `${existingProduct.name} x${existingProduct.quantity}`
        );

      } else {

        this.toastr.error(
          'Excede al stock disponible.'
        );

      }

      return;

    }


    // =============================================
    // PRODUCTO NUEVO
    // =============================================

    data.quantity = 1;

    this.products.push(data);

  }


  // =====================================================
  // BÚSQUEDA MANUAL
  // =====================================================

  onSubmit(): void {

    const query =
      this.code.trim();


    if (!query) {

      return;

    }


    // =============================================
    // SI YA HAY RESULTADOS
    // =============================================

    if (
      this.productosEncontrados.length > 0
    ) {

      const indice =
        this.indiceSeleccionado >= 0
          ? this.indiceSeleccionado
          : 0;

      const producto =
        this.productosEncontrados[indice];

      if (producto) {

        this.seleccionarProducto(
          producto
        );

      }

      return;

    }


    // =============================================
    // BÚSQUEDA MANUAL
    // =============================================

    this.buscandoProductos = true;

    this.productService

      .searchForSale(query)

      .pipe(

        catchError((error: any) => {

          console.error(
            'Error buscando producto:',
            error
          );

          this.buscandoProductos = false;

          this.toastr.error(
            'No se pudo realizar la búsqueda.'
          );

          return of([]);

        })

      )

      .subscribe((productos) => {

        this.buscandoProductos = false;


        // =============================================
        // NO ENCONTRADO
        // =============================================

        if (
          !productos ||
          productos.length === 0
        ) {

          this.toastr.warning(
            `No se encontró ningún producto para "${query}".`
          );

          this.productosEncontrados = [];

          this.mostrarResultados = false;

          return;

        }


        // =============================================
        // RESULTADOS
        // =============================================

        this.productosEncontrados =
          productos;

        this.mostrarResultados =
          true;

        this.indiceSeleccionado =
          0;


        // =============================================
        // UN ÚNICO RESULTADO
        // =============================================

        if (
          productos.length === 1
        ) {

          this.seleccionarProducto(
            productos[0]
          );

        }

      });

  }


  // =====================================================
  // ELIMINAR PRODUCTO
  // =====================================================

  deleteProduct(id: number): void {

    this.products =
      this.products.filter(
        (product) =>
          product.id !== id
      );

  }


  // =====================================================
  // CANTIDAD TOTAL
  // =====================================================

  getTotalQuantity(): number {

    return this.products.reduce(

      (total, product) =>
        total + product.quantity,

      0

    );

  }


  // =====================================================
  // PRECIO TOTAL
  // =====================================================

  getTotalPrice(): number {

    return this.products.reduce(

      (total, product) =>
        total +
        product.salePrice *
        product.quantity,

      0

    );

  }


  // =====================================================
  // BUSCAR CLIENTE
  // =====================================================

  getClient(): void {

    const dialogRef =
      this.dialog.open(
        SearchClientByDniComponent,
        {

          disableClose: true,

          autoFocus: true,

          hasBackdrop: true,

          closeOnNavigation: false,

          data: {
            tipo: 'createProduct'
          }

        }
      );


    dialogRef
      .afterClosed()
      .subscribe((result) => {

        if (result) {

          this.selectedClient =
            result;

        }

      });

  }


  // =====================================================
  // DOCUMENTOS SIN COBRO
  // =====================================================

  private esDocumentoSinCobro(): boolean {

    return (

      this.tipoDocumento ===
      'PRESUPUESTO' ||

      this.tipoDocumento ===
      'REMITO' ||

      this.tipoDocumento ===
      'NOTA_CREDITO_A' ||

      this.tipoDocumento ===
      'NOTA_CREDITO_B' ||

      this.tipoDocumento ===
      'NOTA_CREDITO_C' ||

      this.tipoDocumento ===
      'NOTA_DEBITO_A' ||

      this.tipoDocumento ===
      'NOTA_DEBITO_B' ||

      this.tipoDocumento ===
      'NOTA_DEBITO_C'

    );

  }


  // =====================================================
  // NUEVA VENTA / NUEVO DOCUMENTO
  // =====================================================

  async newSale(): Promise<void> {

    // =============================================
    // VALIDAR PRODUCTOS
    // =============================================

    if (
      this.products.length === 0
    ) {

      this.toastr.warning(
        'No hay artículos seleccionados.'
      );

      return;

    }


    // =============================================
    // VALIDAR CLIENTE
    // =============================================

    if (!this.selectedClient) {

      this.toastr.warning(
        'Debe seleccionar un cliente.'
      );

      return;

    }


    // =============================================
    // DOCUMENTOS SIN COBRO
    // =============================================
    //
    // PRESUPUESTO
    // REMITO
    // NOTA CRÉDITO
    // NOTA DÉBITO
    //
    // IMPORTANTE:
    // NO SE GUARDA TODAVÍA.
    //
    // Primero mostramos confirmación.
    // =============================================

    if (
      this.esDocumentoSinCobro()
    ) {

      this.confirmarGeneracionDocumento();

      return;

    }


    // =============================================
    // DOCUMENTOS QUE REQUIEREN COBRO
    // =============================================

    const dialogRef =
      this.dialog.open(
        TotalSaleComponent,
        {

          disableClose: true,

          autoFocus: true,

          hasBackdrop: true,

          closeOnNavigation: false,

          data: {

            tipoDocumento:
              this.tipoDocumento,

            client:
              this.selectedClient.id,

            totalPrice:
              this.getTotalPrice()

          }

        }
      );


    dialogRef
      .afterClosed()
      .subscribe(
        async (result) => {

          // =============================================
          // CANCELÓ
          // =============================================

          if (
            !result ||
            !result.tipoCuenta
          ) {

            this.toastr.warning(
              'La venta no fue completada.'
            );

            return;

          }


          const formaDePago =
            result.paymentMethod;


          const tipoCuenta =
            result.tipoCuenta;


          const total =
            result.totalPrice;


          const idClient =
            result.idCliente ??
            this.selectedClient.id;


          try {

            // =========================================
            // CONTADO
            // =========================================

            if (
              tipoCuenta ===
              'CONTADO'
            ) {

              const sale =
                this.buildSaleCommon(

                  tipoCuenta,

                  null,

                  formaDePago

                );


              this.saveCommonSale(
                sale
              );

            }


            // =========================================
            // CUENTA CORRIENTE
            // =========================================

            else if (
              tipoCuenta ===
              'CTA_CTE'
            ) {

              const idCtaCte =
                await this.buscarCuentaIdCorrienteCliente(
                  idClient
                );


              const sale =
                this.buildSaleCommon(

                  tipoCuenta,

                  idCtaCte,

                  null

                );


              this.saveCtaCteSale(

                idClient,

                total

              );


              this.saveCommonSale(
                sale
              );

            }

          } catch (error) {

            console.error(
              'Error al procesar el documento:',
              error
            );

            this.toastr.error(
              'Error al procesar el documento.'
            );

          }

        }
      );

  }


  // =====================================================
  // CONFIRMAR DOCUMENTO
  // =====================================================

  private confirmarGeneracionDocumento(): void {

    const data:
      ConfirmDocumentData = {

      tipoDocumento:
        this.tipoDocumento,

      nombreDocumento:
        this.getNombreDocumento(),

      cliente:
        this.obtenerNombreCliente(),

      cantidadProductos:
        this.getTotalQuantity(),

      total:
        this.getTotalPrice(),

      mensaje:
        this.obtenerMensajeConfirmacion()

    };


    const dialogRef =
      this.dialog.open(
        ConfirmDocumentComponent,
        {

          width: '620px',

          maxWidth: '95vw',

          disableClose: true,

          autoFocus: false,

          hasBackdrop: true,

          closeOnNavigation: false,

          data

        }
      );


    dialogRef
      .afterClosed()
      .subscribe(
        (confirmado: boolean) => {

          // =========================================
          // CANCELÓ
          // =========================================

          if (!confirmado) {

            console.log(
              'Generación de documento cancelada.'
            );

            return;

          }


          // =========================================
          // CONFIRMÓ
          // =========================================
          //
          // RECIÉN ACÁ SE CONSTRUYE
          // Y SE GUARDA EL DOCUMENTO.
          // =========================================

          const sale =
            this.buildSaleCommon(

              'CONTADO',

              null,

              this.medioPago

            );


          console.log(
            '=========================================='
          );

          console.log(
            'CONFIRMACIÓN ACEPTADA'
          );

          console.log(
            'GENERANDO DOCUMENTO:',
            this.tipoDocumento
          );

          console.log(
            '=========================================='
          );


          this.saveCommonSale(
            sale
          );

        }
      );

  }


  // =====================================================
  // MENSAJE DE CONFIRMACIÓN
  // =====================================================

  private obtenerMensajeConfirmacion(): string {

    switch (this.tipoDocumento) {

      case 'PRESUPUESTO':

        return (
          'El presupuesto no afectará la caja ni descontará stock.'
        );


      case 'REMITO':

        return (
          'El remito registrará la salida de los productos y descontará el stock correspondiente.'
        );


      case 'NOTA_CREDITO_A':
      case 'NOTA_CREDITO_B':
      case 'NOTA_CREDITO_C':

        return (
          'La nota de crédito será registrada y se aplicarán las operaciones correspondientes al documento.'
        );


      case 'NOTA_DEBITO_A':
      case 'NOTA_DEBITO_B':
      case 'NOTA_DEBITO_C':

        return (
          'La nota de débito será registrada y se aplicarán las operaciones correspondientes al documento.'
        );


      default:

        return (
          'El documento será registrado en el sistema.'
        );

    }

  }


  // =====================================================
  // CUENTA CORRIENTE
  // =====================================================

  buscarCuentaIdCorrienteCliente(
    id: number
  ): Promise<number | null> {

    return new Promise(
      (resolve, reject) => {

        this.clienteService
          .getClientById(id)
          .subscribe({

            next: (data) => {

              const idCuenta =
                data.cuentaCorriente?.id ??
                null;

              console.log(
                '✅ ID cuenta corriente:',
                idCuenta
              );

              resolve(idCuenta);

            },

            error: (err: any) => {

              console.error(
                'Error obteniendo cuenta corriente:',
                err
              );

              reject(err);

            }

          });

      }
    );

  }


  // =====================================================
  // ACTUALIZAR CUENTA CORRIENTE
  // =====================================================

  saveCtaCteSale(
    idCliente: number,
    precioTotal: number
  ): void {

    const payload:
      registrarDeudaCtaCteCliente = {

      registrarDeudaCtaCte:
        precioTotal,

      ticketIds: []

    };


    this.ctaCteService
      .updateCtaCte(
        idCliente,
        payload
      )
      .subscribe({

        next: (response) => {

          console.log(
            'Actualización exitosa',
            response
          );

        },

        error: (error: any) => {

          console.error(
            'Error al actualizar:',
            error
          );

        }

      });

  }


  // =====================================================
  // GENERAR PDF
  // =====================================================

  generatePDF(
    saleCommon: SaleCommon
  ): void {

    const doc =
      new jsPDF();


    doc.setFontSize(18);

    doc.text(
      this.getNombreDocumento(),
      14,
      20
    );


    doc.setFontSize(12);

    doc.text(
      `Cliente: ${this.selectedClient.name}`,
      14,
      30
    );

    doc.text(
      `Dirección: ${this.selectedClient.address}`,
      14,
      40
    );

    doc.text(
      `Número de comprobante: ${saleCommon.numero}`,
      14,
      50
    );

    doc.text(
      `Fecha: ${new Date().toLocaleDateString()}`,
      14,
      60
    );


    let yPosition = 70;


    doc.setFontSize(10);


    doc.text(
      'Descripción',
      14,
      yPosition
    );

    doc.text(
      'Cantidad',
      100,
      yPosition
    );

    doc.text(
      'Precio',
      140,
      yPosition
    );

    doc.text(
      'Total',
      180,
      yPosition
    );


    yPosition += 10;


    saleCommon.ticketDetails
      .forEach((item) => {

        doc.text(
          item.productName,
          14,
          yPosition
        );

        doc.text(
          item.amount.toString(),
          100,
          yPosition
        );

        doc.text(
          item.salePrice.toFixed(2),
          140,
          yPosition
        );

        doc.text(
          (
            item.salePrice *
            item.amount
          ).toFixed(2),
          180,
          yPosition
        );

        yPosition += 10;

      });


    yPosition += 10;


    doc.text(
      `Subtotal: $${saleCommon.subTotal.toFixed(2)}`,
      14,
      yPosition
    );


    yPosition += 10;


    doc.text(
      `Total: $${saleCommon.total.toFixed(2)}`,
      14,
      yPosition
    );


    doc.save(
      `${this.getNombreDocumento()}_${saleCommon.numero}.pdf`
    );

  }


  // =====================================================
  // NOMBRE DOCUMENTO
  // =====================================================

  private getNombreDocumento(): string {

    switch (this.tipoDocumento) {

      case 'FACTURA_A':
        return 'Factura A';

      case 'FACTURA_B':
        return 'Factura B';

      case 'FACTURA_C':
        return 'Factura C';

      case 'PRESUPUESTO':
        return 'Presupuesto';

      case 'REMITO':
        return 'Remito';

      case 'NOTA_CREDITO_A':
        return 'Nota de Crédito A';

      case 'NOTA_CREDITO_B':
        return 'Nota de Crédito B';

      case 'NOTA_CREDITO_C':
        return 'Nota de Crédito C';

      case 'NOTA_DEBITO_A':
        return 'Nota de Débito A';

      case 'NOTA_DEBITO_B':
        return 'Nota de Débito B';

      case 'NOTA_DEBITO_C':
        return 'Nota de Débito C';

      default:
        return 'Comprobante';

    }

  }


  // =====================================================
  // NORMALIZAR MEDIO DE PAGO
  // =====================================================

  private normalizarMedioPago(
    medioPago: string | null | undefined
  ): NonNullable<SaleCommon['medioPago']> {
    switch (medioPago) {
      case 'EFECTIVO':
      case 'TRANSFERENCIA':
      case 'MERCADO_PAGO':
      case 'TARJETA':
      case 'TARJETA_CREDITO':
      case 'TARJETA_DEBITO':
      case 'CHEQUE':
      case 'OTRO':
        return medioPago;
      default:
        return 'EFECTIVO';
    }
  }


  // =====================================================
  // CONSTRUIR VENTA
  // =====================================================

  buildSaleCommon(

    tipoCuenta: string,

    ctaCte: number | null,

    paymentMethod?: string | null

  ): SaleCommon {

    // =============================================
    // CONDICIÓN DE VENTA
    // =============================================

    const condicionVenta =
      tipoCuenta === 'CTA_CTE'
        ? 'CTA_CTE'
        : 'CONTADO';


    // =============================================
    // MEDIO DE PAGO
    // =============================================

    const medioPago: SaleCommon['medioPago'] =
      condicionVenta === 'CONTADO'
        ? this.normalizarMedioPago(paymentMethod ?? this.medioPago)
        : null;


    // =============================================
    // CONSTRUIR DOCUMENTO
    // =============================================

    const sale: SaleCommon = {

      // ===========================================
      // TIPO DOCUMENTO
      // ===========================================

      tipoDocumento:
        this.tipoDocumento,


      // ===========================================
      // CLIENTE
      // ===========================================

      client:
        this.selectedClient.id,


      // ===========================================
      // CUENTA CORRIENTE
      // ===========================================

      ctaCte:
        ctaCte,


      // ===========================================
      // CONDICIÓN
      // ===========================================

      condicionVenta:
        condicionVenta,


      // ===========================================
      // MEDIO DE PAGO
      // ===========================================

      medioPago:
        medioPago,


      // ===========================================
      // NÚMERO
      // ===========================================
      //
      // Actualmente conservamos la generación
      // temporal que ya tenía el componente.
      //
      // Más adelante podemos pasar completamente
      // la numeración al backend.
      // ===========================================

      numero:
        String(
          Math.floor(
            Math.random() * 1000000
          )
        ),


      // ===========================================
      // OBSERVACIÓN
      // ===========================================

      observation:
        'Observación de la venta',


      // ===========================================
      // IMPORTES
      // ===========================================

      subTotal:
        this.getTotalPrice(),

      total:
        this.getTotalPrice(),


      // ===========================================
      // DETALLES
      // ===========================================

      ticketDetails:

        this.products.map(
          (product) => ({

            amount:
              product.quantity,

            price:
              product.price,

            idProduct:
              product.id,

            productName:
              product.name,

            barCode:
              product.barCode,

            salePrice:
              product.salePrice,

            marca:
              product.marca?.marca ?? '',

            iva:
              product.iva,

            subTotal:
              product.salePrice *
              product.quantity

          })
        )

    };


    console.log(
      '=========================================='
    );

    console.log(
      'DOCUMENTO A ENVIAR'
    );

    console.log(
      sale
    );

    console.log(
      '=========================================='
    );


    return sale;

  }


  // =====================================================
  // GUARDAR DOCUMENTO
  // =====================================================

  saveCommonSale(
    saleCommon: SaleCommon
  ): void {

    if (!this.selectedClient) {

      this.toastr.error(
        'Debe seleccionar un cliente.'
      );

      return;

    }


    console.log(
      '=========================================='
    );

    console.log(
      'GUARDANDO DOCUMENTO'
    );

    console.log(
      '=========================================='
    );

    console.log(
      'Tipo documento:',
      this.tipoDocumento
    );

    console.log(
      'Número:',
      saleCommon.numero
    );

    console.log(
      'Cliente:',
      saleCommon.client
    );

    console.log(
      'Condición:',
      saleCommon.condicionVenta
    );

    console.log(
      'Medio pago:',
      saleCommon.medioPago
    );

    console.log(
      'Total:',
      saleCommon.total
    );

    console.log(
      '=========================================='
    );


    this.commonSale
      .saveCommon(saleCommon)
      .subscribe({

        // =============================================
        // ÉXITO
        // =============================================

        next: (response: any) => {

          console.log(
            '=========================================='
          );

          console.log(
            'DOCUMENTO GENERADO CORRECTAMENTE'
          );

          console.log(
            '=========================================='
          );

          console.log(
            'Respuesta backend:',
            response
          );


          // =============================================
          // NÚMERO BACKEND
          // =============================================

          const numeroGenerado =
            response?.numero ??
            response?.number ??
            response?.numeroComprobante ??
            saleCommon.numero;


          // =============================================
          // ESTADO
          // =============================================

          const estadoGenerado =
            response?.estado ??
            response?.state ??
            this.obtenerEstadoDocumento();

          const numeroFinal =
            response?.numero ??
            response?.number ??
            response?.numeroComprobante ??
            saleCommon.numero;

          const estadoFinal =
            response?.estado ??
            response?.state ??
            this.obtenerEstadoDocumento();

          console.log('==========================================');
          console.log('DOCUMENTO GENERADO CORRECTAMENTE');
          console.log('Tipo:', this.getNombreDocumento());
          console.log('Número:', numeroFinal);
          console.log('Estado:', estadoFinal);
          console.log('==========================================');

          this.toastr.success(
            `${this.getNombreDocumento()} N° ${numeroFinal} generado correctamente.`
          );

          // =============================================
          // GENERAR PDF
          // =============================================
          // El documento ya fue guardado correctamente
          // en el backend. Recién ahora generamos el PDF.
          // Usamos saleCommon porque contiene exactamente
          // los productos y totales que fueron enviados.
          // =============================================

          try {

            this.generatePDF(saleCommon);

          } catch (pdfError: any) {

            console.error(
              'Error generando PDF:',
              pdfError
            );

            this.toastr.warning(
              'El documento fue guardado, pero no se pudo generar el PDF.'
            );

          }

          // =============================================
          // LIMPIAR FORMULARIO
          // =============================================

          this.limpiarVenta();


          // =============================================
          // ERROR
        // =============================================

        error: (error: any) => {

          console.error(
            '=========================================='
          );

          console.error(
            'ERROR GUARDANDO DOCUMENTO'
          );

          console.error(
            error
          );

          console.error(
            '=========================================='
          );


          const mensaje =
            error?.error?.message ??
            error?.error?.error ??
            'Hubo un error al guardar el documento.';


          this.toastr.error(
            mensaje
          );

        }
}
      });

  }


  // =====================================================
  // NOMBRE CLIENTE
  // =====================================================

  private obtenerNombreCliente(): string {

    if (!this.selectedClient) {

      return 'Consumidor Final';

    }


    const nombre =
      this.selectedClient.name ??
      '';


    const apellido =
      this.selectedClient.lastName ??
      '';


    const nombreCompleto =
      `${nombre} ${apellido}`.trim();


    return (
      nombreCompleto ||
      'Consumidor Final'
    );

  }


  // =====================================================
  // ESTADO DOCUMENTO
  // =====================================================

  private obtenerEstadoDocumento(): string {

    switch (this.tipoDocumento) {

      case 'PRESUPUESTO':

        return 'BORRADOR';


      case 'REMITO':

        return 'EMITIDO';


      case 'NOTA_CREDITO_A':
      case 'NOTA_CREDITO_B':
      case 'NOTA_CREDITO_C':

        return 'EMITIDO';


      case 'NOTA_DEBITO_A':
      case 'NOTA_DEBITO_B':
      case 'NOTA_DEBITO_C':

        return 'EMITIDO';


      case 'FACTURA_A':
      case 'FACTURA_B':
      case 'FACTURA_C':

        return 'PAGADO';


      default:

        return 'EMITIDO';

    }

  }


  // =====================================================
  // MENSAJE DOCUMENTO
  // =====================================================

  private obtenerMensajeDocumento(): string {

    switch (this.tipoDocumento) {

      case 'PRESUPUESTO':

        return (
          'El presupuesto fue generado. No afecta caja ni stock.'
        );


      case 'REMITO':

        return (
          'El remito fue generado correctamente.'
        );


      case 'NOTA_CREDITO_A':
      case 'NOTA_CREDITO_B':
      case 'NOTA_CREDITO_C':

        return (
          'La nota de crédito fue generada correctamente.'
        );


      case 'NOTA_DEBITO_A':
      case 'NOTA_DEBITO_B':
      case 'NOTA_DEBITO_C':

        return (
          'La nota de débito fue generada correctamente.'
        );


      case 'FACTURA_A':
      case 'FACTURA_B':
      case 'FACTURA_C':

        return (
          'La factura fue generada y procesada correctamente.'
        );


      default:

        return (
          'El documento fue generado correctamente.'
        );

    }

  }


  // =====================================================
  // ¿ACTUALIZA CAJA?
  // =====================================================

  private documentoActualizaCaja():
    boolean | undefined {

    switch (this.tipoDocumento) {

      case 'FACTURA_A':
      case 'FACTURA_B':
      case 'FACTURA_C':

        return true;


      case 'PRESUPUESTO':
      case 'REMITO':
      case 'NOTA_CREDITO_A':
      case 'NOTA_CREDITO_B':
      case 'NOTA_CREDITO_C':
      case 'NOTA_DEBITO_A':
      case 'NOTA_DEBITO_B':
      case 'NOTA_DEBITO_C':

        return undefined;


      default:

        return undefined;

    }

  }


  // =====================================================
  // ¿ACTUALIZA STOCK?
  // =====================================================

  private documentoActualizaStock():
    boolean | undefined {

    switch (this.tipoDocumento) {

      // =============================================
      // PRESUPUESTO
      // =============================================

      case 'PRESUPUESTO':

        return false;


      // =============================================
      // REMITO
      // =============================================

      case 'REMITO':

        return true;


      // =============================================
      // NOTA CRÉDITO
      // =============================================

      case 'NOTA_CREDITO_A':
      case 'NOTA_CREDITO_B':
      case 'NOTA_CREDITO_C':

        return true;


      // =============================================
      // NOTA DÉBITO
      // =============================================

      case 'NOTA_DEBITO_A':
      case 'NOTA_DEBITO_B':
      case 'NOTA_DEBITO_C':

        return true;


      // =============================================
      // FACTURAS
      // =============================================

      case 'FACTURA_A':
      case 'FACTURA_B':
      case 'FACTURA_C':

        return true;


      default:

        return undefined;

    }

  }


  // =====================================================
  // LIMPIAR VENTA
  // =====================================================

  private limpiarVenta(): void {

    this.products = [];

    this.code = '';

    this.productosEncontrados = [];

    this.mostrarResultados = false;

    this.indiceSeleccionado = -1;

    this.saleCommon = undefined;

    this.selectedClient = undefined;

    this.buscandoProductos = false;

  }


  // =====================================================
  // IMPRIMIR TICKET
  // =====================================================

  printTicket(
    saleCommon: SaleCommon,
    formato: 'A4' | 'TERMICA' = 'A4'
  ): void {

    const styles = `

      <style>

        @page {
          margin: 0;
        }

        body {

          font-family: Arial, sans-serif;

          margin: 0;

          padding: 10px;

          ${
            formato === 'TERMICA'
              ? 'width: 58mm;'
              : 'width: auto;'
          }

          font-size:
            ${
              formato === 'TERMICA'
                ? '12px'
                : '14px'
            };

        }

        hr {

          border: none;

          border-top:
            1px dashed #000;

          margin: 5px 0;

        }

        .row {

          display: flex;

          justify-content:
            space-between;

        }

        .ticket-pagina {

          page-break-after:
            always;

        }

        table {

          width: 100%;

          border-collapse:
            collapse;

          font-size:
            ${
              formato === 'TERMICA'
                ? '11px'
                : '14px'
            };

        }

        th,
        td {

          padding:
            2px 4px;

        }

        th {

          text-align: left;

        }

      </style>

    `;


    const itemsHTML = `

      <table>

        <thead>

          <tr>

            <th>
              Producto
            </th>

            <th>
              Cant
            </th>

            <th>
              Precio
            </th>

            <th>
              SubTotal
            </th>

          </tr>

        </thead>

        <tbody>

          ${saleCommon.ticketDetails

            .map(

              (d) => `

                <tr>

                  <td>
                    ${d.productName}
                  </td>

                  <td>
                    ${d.amount}
                  </td>

                  <td>
                    $${d.price.toFixed(2)}
                  </td>

                  <td>
                    $${d.subTotal.toFixed(2)}
                  </td>

                </tr>

              `

            )

            .join('')}

        </tbody>

      </table>

    `;


    const content = `

      <html>

        <head>

          ${styles}

        </head>

        <body

          onload="

            window.print();

            window.onafterprint =
              () => window.close();

          "

        >

          <div class="ticket-pagina">

            <h2
              style="
                text-align: center;
              "
            >
              BON-BINI
            </h2>


            <p
              style="
                text-align: center;
              "
            >
              CUIT 27-29625726-0
            </p>


            <p
              style="
                text-align: center;
              "
            >
              COMPROBANTE NO VALIDO COMO FACTURA X
            </p>


            <hr>


            <p>

              Documento:
              ${this.getNombreDocumento()}

            </p>


            <p>

              Ticket N°:
              ${saleCommon.numero}

            </p>


            <p>

              Cliente:
              ${this.selectedClient?.name}

            </p>


            <p>

              Fecha:
              ${new Date().toLocaleString()}

            </p>


            <hr>


            ${itemsHTML}


            <hr>


            <div class="row">

              <strong>
                Total:
              </strong>

              <strong>
                $${saleCommon.total.toFixed(2)}
              </strong>

            </div>


            <hr>


            <p
              style="
                text-align: center;
              "
            >
              ¡Gracias por su compra!
            </p>


          </div>

        </body>

      </html>

    `;


    const popupWin =
      window.open(
        '',
        '_blank',
        'width=250,height=600'
      );


    if (popupWin) {

      popupWin.document.open();

      popupWin.document.write(
        content
      );

      popupWin.document.close();

    }

  }


  // =====================================================
  // AUMENTAR CANTIDAD
  // =====================================================

  increaseQuantity(
    product: ProductItemSale
  ): void {

    if (
      product.quantity <
      product.stock
    ) {

      product.quantity++;

    } else {

      this.toastr.warning(
        'No hay más stock disponible.'
      );

    }

  }


  // =====================================================
  // DISMINUIR CANTIDAD
  // =====================================================

  decreaseQuantity(
    product: ProductItemSale
  ): void {

    if (
      product.quantity > 1
    ) {

      product.quantity--;

      return;

    }

    this.deleteProduct(
      product.id
    );

  }


  // =====================================================
  // TEXTO BOTÓN
  // =====================================================

  get textoAccionDocumento(): string {

    switch (this.tipoDocumento) {

      case 'FACTURA_A':
      case 'FACTURA_B':
      case 'FACTURA_C':

        return 'Cobrar venta';


      case 'PRESUPUESTO':

        return 'Generar presupuesto';


      case 'REMITO':

        return 'Generar remito';


      case 'NOTA_CREDITO_A':
      case 'NOTA_CREDITO_B':
      case 'NOTA_CREDITO_C':

        return 'Generar nota de crédito';


      case 'NOTA_DEBITO_A':
      case 'NOTA_DEBITO_B':
      case 'NOTA_DEBITO_C':

        return 'Generar nota de débito';


      default:

        return 'Generar documento';

    }

  }


  // =====================================================
  // ICONO BOTÓN
  // =====================================================

  get iconoAccionDocumento(): string {

    switch (this.tipoDocumento) {

      case 'FACTURA_A':
      case 'FACTURA_B':
      case 'FACTURA_C':

        return 'payments';


      case 'PRESUPUESTO':

        return 'request_quote';


      case 'REMITO':

        return 'local_shipping';


      case 'NOTA_CREDITO_A':
      case 'NOTA_CREDITO_B':
      case 'NOTA_CREDITO_C':

        return 'assignment_return';


      case 'NOTA_DEBITO_A':
      case 'NOTA_DEBITO_B':
      case 'NOTA_DEBITO_C':

        return 'request_quote';


      default:

        return 'description';

    }

  }

}
