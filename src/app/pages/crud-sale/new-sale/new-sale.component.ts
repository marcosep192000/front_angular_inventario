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

import { Subject, of } from 'rxjs';

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
import { registrarDeudaCtaCteCliente } from '../../../interfaces/registrarDeudaCtaCteCliente';
import { SaleCommon } from '../../../interfaces/sale-common';

import { SearchClientByDniComponent } from '../../crud-client/search-client-by-dni/search-client-by-dni.component';

import { IconComponent } from '../../../shared/dasboard/icon/icon.component';


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
    IconComponent
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
  // PRODUCTOS DE LA VENTA
  // =====================================================

  products = new Array<ProductItemSale>();

  code: string = '';

  product?: ProductItemSale;

  errorMessage?: string;


  // =====================================================
  // BUSCADOR DE PRODUCTOS
  // =====================================================

  private busquedaProducto$ =
    new Subject<string>();

  productosEncontrados: ProductItemSale[] = [];

  mostrarResultados = false;

  buscandoProductos = false;

  indiceSeleccionado = -1;


  // =====================================================
  // INPUT DEL BUSCADOR
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

          const texto = query.trim();


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

              catchError((error) => {

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

        this.buscandoProductos = false;

        this.indiceSeleccionado = -1;

      });

  }


  // =====================================================
  // CAMBIO DEL INPUT
  // =====================================================

  buscarProductos(
    texto: string
  ): void {

    this.busquedaProducto$.next(texto);

  }


  // =====================================================
  // TECLADO DEL BUSCADOR
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
      // SI TODAVÍA ESTÁ BUSCANDO
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

      if (this.indiceSeleccionado > 0) {

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

    this.agregarProducto(
      producto
    );

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
  // AGREGAR PRODUCTO A LA VENTA
  // =====================================================

  private agregarProducto(
    data: ProductItemSale
  ): void {

    // =============================================
    // CONTROL DE STOCK
    // =============================================

    if (data.stock <= 0) {

      this.toastr.warning(
        `El producto "${data.name}" no tiene stock disponible.`
      );

      return;

    }


    // =============================================
    // BUSCAR SI YA EXISTE
    // =============================================

    const existingProduct =
      this.products.find(
        product =>
          product.id === data.id
      );


    // =============================================
    // PRODUCTO YA EXISTE
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
  // BUSQUEDA MANUAL
  // =====================================================

  onSubmit(): void {

    const query =
      this.code.trim();

    if (!query) {

      return;

    }

    // =============================================
    // SI YA TENEMOS RESULTADOS
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
    //
    // IMPORTANTE:
    // Ya NO utilizamos findByCode.
    //
    // Nombre, código y barcode utilizan
    // el mismo endpoint search-for-sale.
    // =============================================

    this.buscandoProductos = true;

    this.productService
      .searchForSale(query)

      .pipe(

        catchError((error) => {

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

        this.mostrarResultados = true;

        this.indiceSeleccionado = 0;


        // =============================================
        // SI HAY UN ÚNICO RESULTADO
        //
        // Lo agregamos directamente.
        // Esto hace que escribir un código exacto
        // sea rapidísimo.
        // =============================================

        if (productos.length === 1) {

          this.seleccionarProducto(
            productos[0]
          );

        }

      });

  }


  // =====================================================
  // ELIMINAR PRODUCTO
  // =====================================================

  deleteProduct(
    id: number
  ): void {

    this.products =
      this.products.filter(
        product =>
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
  // NUEVA VENTA
  // =====================================================

  async newSale(): Promise<void> {

    if (
      this.products.length === 0
    ) {

      this.toastr.warning(
        'No hay artículos seleccionados.'
      );

      return;

    }


    if (!this.selectedClient) {

      this.toastr.warning(
        'Debe seleccionar un cliente.'
      );

      return;

    }


    const dialogRef =
      this.dialog.open(
        TotalSaleComponent,
        {

          disableClose: true,

          autoFocus: true,

          hasBackdrop: true,

          closeOnNavigation: false,

          data: {

            tipo: '',

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

          if (
            !result ||
            !result.tipoCuenta
          ) {

            this.toastr.warning(
              'La venta no fue completada.'
            );

            this.products = [];

            this.code = '';

            return;

          }


          const formaDePago =
            result.paymentMethod;

          const tipoCuenta =
            result.tipoCuenta;

          const total =
            result.totalPrice;

          const idClient =
            result.idCliente;


          try {

            if (
              tipoCuenta === 'CONTADO'
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

            } else if (
              tipoCuenta === 'CTA_CTE'
            ) {

              const idCtaCte =
                await this.buscarCuentaIdCorrienteCliente(
                  idClient
                );


              const sale =
                this.buildSaleCommon(
                  tipoCuenta,
                  idCtaCte,
                  formaDePago
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

            this.toastr.error(
              'Error al procesar la venta.'
            );

          }

        }
      );

  }


  // =====================================================
  // CUENTA CORRIENTE
  // =====================================================

  buscarCuentaIdCorrienteCliente(
    id: number
  ): Promise<any> {

    return new Promise(
      (resolve, reject) => {

        this.clienteService
          .getClientById(id)
          .subscribe({

            next: (data) => {

              const idCuenta =
                data.cuentaCorriente?.id;

              console.log(
                '✅ ID cuenta corriente:',
                idCuenta
              );

              resolve(idCuenta);

            },

            error: (err) => {

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
    tipoDeCuenta: any,
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
        tipoDeCuenta,
        payload
      )
      .subscribe({

        next: (response) => {

          console.log(
            'Actualización exitosa',
            response
          );

        },

        error: (error) => {

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
      'Factura de Venta',
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
      `Número de ticket: ${saleCommon.numero}`,
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
      `Total: $${saleCommon.subTotal.toFixed(2)}`,
      14,
      yPosition
    );


    doc.save(
      `Factura_${saleCommon.numero}.pdf`
    );

  }


  // =====================================================
  // CONSTRUIR VENTA
  // =====================================================

  buildSaleCommon(
    tipo: string,
    ctaCte: any,
    paymentMethod?: string
  ): SaleCommon {

    const sale: SaleCommon = {

      tipo: 'FACTURA',

      stateTicket:
        tipo === 'CTA_CTE'
          ? false
          : true,

      ctaCte:
        ctaCte,

      saleCondition:
        tipo,

      client:
        this.selectedClient.id,

      numero:
        Math.floor(
          Math.random() *
          1000000
        ),

      observation:
        'Observación de la venta',

      subTotal:
        this.getTotalPrice(),

      total:
        this.getTotalPrice(),

      paymentMethod:
        paymentMethod || null,

      ticketDetails:

        this.products.map(
          (product) => ({

            amount:
              product.quantity,

            price:
              product.salePrice,

            idProduct:
              product.id,

            productName:
              product.name,

            barCode:
              product.barCode,

            salePrice:
              product.salePrice,

            marca:
              String(product.marca),

            iva:
              product.iva,

            subTotal:
              product.salePrice *
              product.quantity

          })
        )

    };


    console.log(
      sale
    );


    return sale;

  }


  // =====================================================
  // GUARDAR VENTA
  // =====================================================

  saveCommonSale(
    saleCommon: SaleCommon
  ): void {

    if (
      !this.selectedClient
    ) {

      this.toastr.error(
        'Debe seleccionar un cliente.'
      );

      return;

    }


    this.commonSale
      .saveCommon(saleCommon)
      .subscribe({

        next: () => {

          this.toastr.success(
            'Venta guardada con éxito'
          );


          const confirmPrint =
            window.confirm(
              '¿Desea imprimir el ticket?'
            );


          if (confirmPrint) {

            this.printTicket(
              saleCommon
            );

          } else {

            this.generatePDF(
              saleCommon
            );

          }


          this.products = [];

          this.code = '';

        },

        error: (error) => {

          console.error(
            'Error guardando venta:',
            error
          );

          this.toastr.error(
            'Hubo un error al guardar la venta'
          );

        }

      });

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

            <th>Producto</th>

            <th>Cant</th>

            <th>Precio</th>

            <th>SubTotal</th>

          </tr>

        </thead>

        <tbody>

          ${
            saleCommon.ticketDetails
              .map(
                d => `

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
              .join('')
          }

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
                $${saleCommon.total?.toFixed(2)}
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

}
