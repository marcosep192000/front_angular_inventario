import { CommonModule } from '@angular/common';

import {
  Component,
  EventEmitter,
  OnInit,
  Output
} from '@angular/core';

import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  MatNativeDateModule
} from '@angular/material/core';

import {
  MatDatepickerModule
} from '@angular/material/datepicker';

import {
  MatDialog,
  MatDialogModule
} from '@angular/material/dialog';

import {
  MatFormFieldModule
} from '@angular/material/form-field';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  MatInputModule
} from '@angular/material/input';

import {
  MatSelectModule
} from '@angular/material/select';

import {
  MatSlideToggleModule
} from '@angular/material/slide-toggle';

import {
  ToastrModule,
  ToastrService
} from 'ngx-toastr';

import {
  ProductService
} from '../../../../services/product.service';

import {
  ProductItemBuy
} from '../../../../interfaces/ProductItemBuy';

import {
  FormProductComponent
} from '../../../crud-product/form-product/form-product.component';


/* =========================================================
   DESCUENTO DE PRODUCTO
========================================================= */

export interface DescuentoDetalleProveedor {

  porcentaje: number;

  descripcion: string;

  orden: number;

}


/* =========================================================
   PRODUCTO INTERNO CON DATOS DE COMPRA
========================================================= */

interface ProductItemBuyFactura
  extends ProductItemBuy {

  precioLista?: number;

  precioNeto?: number;

  descuentos?: DescuentoDetalleProveedor[];

  subtotalNeto?: number;

  importeIva?: number;

}


/* =========================================================
   COMPONENTE
========================================================= */

@Component({

  selector:
    'app-registrar-detalle-factura-proveedor',

  standalone:
    true,

  imports: [

    CommonModule,

    MatFormFieldModule,

    MatInputModule,

    MatDatepickerModule,

    MatNativeDateModule,

    MatSelectModule,

    ReactiveFormsModule,

    FormsModule,

    MatButtonModule,

    MatDialogModule,

    MatIconModule,

    MatSlideToggleModule,

    ToastrModule

  ],

  templateUrl:
    './registrar-detalle-factura-proveedor.component.html',

  styleUrl:
    './registrar-detalle-factura-proveedor.component.css'

})
export class RegistrarDetalleFacturaProveedorComponent
  implements OnInit {


  // =========================================================
  // OUTPUTS
  // =========================================================

  @Output()
  productosEmitidos =
    new EventEmitter<ProductItemBuy[]>();


  @Output()
  limpiarTotal =
    new EventEmitter<boolean>();


  // =========================================================
  // PRODUCTOS
  // =========================================================

  products:
    ProductItemBuyFactura[] = [];

  readonly opcionesIva = [
    { porcentaje: 0, tipo: 'IVA_0', etiqueta: 'No gravado / Exento (0%)' },
    { porcentaje: 2.5, tipo: 'IVA_2_5', etiqueta: 'IVA 2,5%' },
    { porcentaje: 5, tipo: 'IVA_5', etiqueta: 'IVA 5%' },
    { porcentaje: 10.5, tipo: 'IVA_10_5', etiqueta: 'IVA 10,5%' },
    { porcentaje: 21, tipo: 'IVA_21', etiqueta: 'IVA 21%' },
    { porcentaje: 27, tipo: 'IVA_27', etiqueta: 'IVA 27%' },
  ];


  code = '';

  product:
    ProductItemBuy | null = null;


  // =========================================================
  // FORMULARIO
  // =========================================================

  formProduct!: FormGroup;


  // =========================================================
  // ESTADO
  // =========================================================

  showForm = false;

  showFormTotal = false;


  // =========================================================
  // DESCUENTOS DEL PRODUCTO ACTUAL
  // =========================================================

  descuentos:
    DescuentoDetalleProveedor[] = [];


  // =========================================================
  // NUEVO DESCUENTO
  // =========================================================

  nuevoDescuentoPorcentaje:
    number | null = null;


  nuevoDescuentoDescripcion =
    '';


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(

    private productService:
      ProductService,

    private fb:
      FormBuilder,

    private toastr:
      ToastrService,

    private dialog:
      MatDialog

  ) { }


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.initForms();

    this.enviarProductos();

  }


  // =========================================================
  // CREAR FORMULARIO
  // =========================================================

  private initForms(): void {

    this.formProduct =
      this.fb.group({

        name: [''],

        description: [''],


        price: [

          0,

          [

            Validators.required,

            Validators.min(0)

          ]

        ],


        stock: [

          0,

          [

            Validators.required,

            Validators.min(0)

          ]

        ],


        iva: [

          21,

          [

            Validators.required,

            Validators.min(0)

          ]

        ],


        quantity: [

          1,

          [

            Validators.required,

            Validators.min(1)

          ]

        ],


        totalStock: [

          {

            value: 0,

            disabled: true

          }

        ],


        precioNeto: [

          {

            value: 0,

            disabled: true

          }

        ],


        precioTotal: [

          {

            value: 0,

            disabled: true

          }

        ]

      });


    // =======================================================
    // CANTIDAD
    // =======================================================

    this.formProduct
      .get('quantity')
      ?.valueChanges
      .subscribe(() => {

        this.calcularTotalesProducto();

      });


    // =======================================================
    // PRECIO
    // =======================================================

    this.formProduct
      .get('price')
      ?.valueChanges
      .subscribe(() => {

        this.calcularTotalesProducto();

      });


    // =======================================================
    // IVA
    // =======================================================

    this.formProduct
      .get('iva')
      ?.valueChanges
      .subscribe(() => {

        this.calcularTotalesProducto();

      });


    // =======================================================
    // STOCK
    // =======================================================

    this.formProduct
      .get('stock')
      ?.valueChanges
      .subscribe(() => {

        this.calcularTotalesProducto();

      });

  }


  // =========================================================
  // CALCULAR TOTALES PRODUCTO
  // =========================================================

  private calcularTotalesProducto(): void {

    if (!this.formProduct) {

      return;

    }


    const stock =
      Number(
        this.formProduct
          .get('stock')
          ?.value
      ) || 0;


    const price =
      Number(
        this.formProduct
          .get('price')
          ?.value
      ) || 0;


    const iva =
      Number(
        this.formProduct
          .get('iva')
          ?.value
      ) || 0;


    const quantity =
      Number(
        this.formProduct
          .get('quantity')
          ?.value
      ) || 0;


    // =======================================================
    // PRECIO NETO UNITARIO
    // =======================================================

    const precioNeto =
      this.calcularPrecioNeto(
        price
      );


    // =======================================================
    // SUBTOTAL NETO
    // =======================================================

    const subtotalNeto =
      precioNeto *
      quantity;


    // =======================================================
    // IVA
    // =======================================================

    const importeIva =
      (
        subtotalNeto *
        iva
      ) / 100;


    // =======================================================
    // TOTAL
    // =======================================================

    const precioTotal =
      subtotalNeto +
      importeIva;


    // =======================================================
    // STOCK FINAL
    // =======================================================

    const totalStock =
      stock +
      quantity;


    // =======================================================
    // ACTUALIZAR FORMULARIO
    // =======================================================

    this.formProduct.patchValue(

      {

        totalStock:
          this.redondear(
            totalStock
          ),

        precioNeto:
          this.redondear(
            precioNeto
          ),

        precioTotal:
          this.redondear(
            precioTotal
          )

      },

      {

        emitEvent:
          false

      }

    );

  }


  // =========================================================
  // CALCULAR PRECIO NETO
  // =========================================================

  private calcularPrecioNeto(
    precioLista: number
  ): number {

    let precioActual =
      Number(precioLista) || 0;


    /*
     * Los descuentos son SUCESIVOS.
     *
     * Ejemplo:
     *
     * $10.000
     * - 10% = $9.000
     * - 5%  = $8.550
     */

    const descuentosOrdenados =
      [...this.descuentos]
        .sort(
          (
            a,
            b
          ) =>
            a.orden -
            b.orden
        );


    for (
      const descuento
      of descuentosOrdenados
    ) {

      const porcentaje =
        Number(
          descuento.porcentaje
        ) || 0;


      precioActual -=
        (
          precioActual *
          porcentaje
        ) / 100;

    }


    return this.redondear(
      Math.max(
        precioActual,
        0
      )
    );

  }


  // =========================================================
  // AGREGAR DESCUENTO
  // =========================================================

  agregarDescuento(): void {

    const porcentaje =
      Number(
        this.nuevoDescuentoPorcentaje
      );


    // =======================================================
    // VALIDAR PORCENTAJE
    // =======================================================

    if (

      !Number.isFinite(
        porcentaje
      )

      ||

      porcentaje <= 0

      ||

      porcentaje > 100

    ) {

      this.toastr.warning(
        'El descuento debe estar entre 0,01% y 100%.'
      );

      return;

    }


    // =======================================================
    // ORDEN
    // =======================================================

    const orden =
      this.descuentos.length +
      1;


    // =======================================================
    // DESCRIPCIÓN
    // =======================================================

    const descripcion =
      this.nuevoDescuentoDescripcion
        ?.trim() ||


      `Descuento ${orden}`;


    // =======================================================
    // AGREGAR
    // =======================================================

    this.descuentos = [

      ...this.descuentos,

      {

        porcentaje:
          this.redondear(
            porcentaje
          ),

        descripcion,

        orden

      }

    ];


    // =======================================================
    // LIMPIAR CAMPOS
    // =======================================================

    this.nuevoDescuentoPorcentaje =
      null;


    this.nuevoDescuentoDescripcion =
      '';


    // =======================================================
    // REORDENAR
    // =======================================================

    this.reordenarDescuentos();


    // =======================================================
    // RECALCULAR
    // =======================================================

    this.calcularTotalesProducto();

  }


  // =========================================================
  // ELIMINAR DESCUENTO
  // =========================================================

  eliminarDescuento(
    index: number
  ): void {

    if (

      index < 0 ||

      index >= this.descuentos.length

    ) {

      return;

    }


    this.descuentos =
      this.descuentos.filter(

        (
          _,
          i
        ) =>

          i !== index

      );


    this.reordenarDescuentos();


    this.calcularTotalesProducto();

  }


  // =========================================================
  // REORDENAR DESCUENTOS
  // =========================================================

  private reordenarDescuentos(): void {

    this.descuentos =
      this.descuentos.map(

        (
          descuento,
          index
        ) => ({

          ...descuento,

          orden:
            index + 1

        })

      );

  }


  // =========================================================
  // BUSCAR PRODUCTO
  // =========================================================

  onInputChange(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    this.code =
      input.value.trim();

    if (!this.code) {

      this.resetForm();

      return;
    }

    this.productService
      .searchProductBuy(this.code)
      .subscribe({

        next: (data: ProductItemBuy) => {

          console.log(
            '========== PRODUCTO ENCONTRADO =========='
          );

          console.log(
            'Producto:',
            data.name
          );

          console.log(
            'Precio recibido:',
            data.price
          );

          console.log(
            'IVA:',
            data.iva
          );

          console.log(
            'Stock:',
            data.stock
          );

          console.log(
            '=========================================='
          );

          this.product = data;

          this.loadProduct(data);

          this.showForm = true;
        },

        error: () => {

          this.product = null;

          this.showForm = false;

          this.toastr.warning(
            'No se encontró un producto con ese código de barras.'
          );
        }

      });
  }


  // =========================================================
  // CARGAR PRODUCTO
  // =========================================================

  loadProduct(
    data: ProductItemBuy
  ): void {

    if (!data) {

      console.warn(
        'Producto no encontrado'
      );

      return;

    }


    this.product =
      data;


    // =======================================================
    // LIMPIAR DESCUENTOS ANTERIORES
    // =======================================================

    this.descuentos =
      [];


    this.nuevoDescuentoPorcentaje =
      null;


    this.nuevoDescuentoDescripcion =
      '';


    // =======================================================
    // PRECIO
    // =======================================================

    const precio =
      Number(
        data.price
      ) || 0;


    // =======================================================
    // IVA
    // =======================================================

    const ivaRecibido = Number(data.iva);
    const iva = this.esAlicuotaValida(ivaRecibido) ? ivaRecibido : 21;


    // =======================================================
    // CANTIDAD
    // =======================================================

    const cantidad =
      1;


    // =======================================================
    // STOCK
    // =======================================================

    const stock =
      Number(
        data.stock
      ) || 0;


    // =======================================================
    // PRECIO NETO
    // =======================================================

    const precioNeto =
      this.calcularPrecioNeto(
        precio
      );


    // =======================================================
    // SUBTOTAL
    // =======================================================

    const subtotal =
      precioNeto *
      cantidad;


    // =======================================================
    // IVA
    // =======================================================

    const importeIva =
      (
        subtotal *
        iva
      ) / 100;


    // =======================================================
    // TOTAL
    // =======================================================

    const precioTotal =
      subtotal +
      importeIva;


    // =======================================================
    // FORMULARIO
    // =======================================================

    this.formProduct.patchValue(

      {

        name:
          data.name,


        description:
          data.description ??
          '',


        stock,


        iva,


        price:
          precio,


        quantity:
          cantidad,


        totalStock:
          stock +
          cantidad,


        precioNeto:
          this.redondear(
            precioNeto
          ),


        precioTotal:
          this.redondear(
            precioTotal
          )

      },

      {

        emitEvent:
          false

      }

    );


    // =======================================================
    // SOLO LECTURA
    // =======================================================

    this.formProduct
      .get('name')
      ?.disable();


    this.formProduct
      .get('description')
      ?.disable();


    this.formProduct
      .get('stock')
      ?.disable();


  }


  // =========================================================
  // AGREGAR PRODUCTO
  // =========================================================

  addListProduct(): void {

    // =======================================================
    // OBTENER VALORES
    // =======================================================

    const precio =
      Number(
        this.formProduct
          .get('price')
          ?.value
      ) || 0;


    const cantidad =
      Number(
        this.formProduct
          .get('quantity')
          ?.value
      ) || 0;


    const iva =
      Number(
        this.formProduct
          .get('iva')
          ?.value
      ) || 0;


    const stock =
      Number(
        this.formProduct
          .get('stock')
          ?.value
      ) || 0;


    // =======================================================
    // VALIDAR PRODUCTO
    // =======================================================

    if (!this.product) {

      this.toastr.error(
        'Primero debes seleccionar un producto.'
      );

      return;

    }


    // =======================================================
    // VALIDAR PRECIO
    // =======================================================

    if (precio <= 0) {

      this.toastr.error(
        'El precio del producto debe ser mayor a cero.'
      );

      return;

    }


    // =======================================================
    // VALIDAR CANTIDAD
    // =======================================================

    if (cantidad <= 0) {

      this.toastr.error(
        'La cantidad debe ser mayor a cero.'
      );

      return;

    }


    // =======================================================
    // PRECIO NETO
    // =======================================================

    const precioNeto =
      this.calcularPrecioNeto(
        precio
      );


    // =======================================================
    // SUBTOTAL NETO
    // =======================================================

    const subtotalNeto =
      precioNeto *
      cantidad;


    // =======================================================
    // IVA
    // =======================================================

    const importeIva =
      (
        subtotalNeto *
        iva
      ) / 100;


    // =======================================================
    // TOTAL
    // =======================================================

    const precioTotal =
      subtotalNeto +
      importeIva;


    // =======================================================
    // COPIAR DESCUENTOS
    // =======================================================

    const descuentosProducto =
      this.descuentos.map(
        descuento => ({

          porcentaje:
            descuento.porcentaje,

          descripcion:
            descuento.descripcion,

          orden:
            descuento.orden

        })
      );


    // =======================================================
    // CREAR PRODUCTO DE COMPRA
    // =======================================================

    const productData:
      ProductItemBuyFactura = {

      id:
        this.product.id,


      barCode:
        this.product.barCode ??
        this.code,


      name:
        this.product.name,


      description:
        this.product.description ??
        '',


      // =====================================================
      // PRECIO NETO
      // =====================================================

      price:
        this.redondear(
          precioNeto
        ),


      // =====================================================
      // PRECIO ORIGINAL
      // =====================================================

      precioLista:
        this.redondear(
          precio
        ),


      // =====================================================
      // DESCUENTOS
      // =====================================================

      descuentos:
        descuentosProducto,


      // =====================================================
      // STOCK
      // =====================================================

      stock,


      stockMin:
        this.product.stockMin ??
        0,


      // =====================================================
      // IVA
      // =====================================================

      iva,

      tipoIva:
        this.obtenerTipoIva(
          iva
        ),


      // =====================================================
      // CANTIDAD
      // =====================================================

      quantity:
        cantidad,


      // =====================================================
      // STOCK TOTAL
      // =====================================================

      totalStock:
        stock +
        cantidad,


      // =====================================================
      // SUBTOTAL NETO
      // =====================================================

      subtotalNeto:
        this.redondear(
          subtotalNeto
        ),


      // =====================================================
      // IVA IMPORTE
      // =====================================================

      importeIva:
        this.redondear(
          importeIva
        ),


      // =====================================================
      // TOTAL
      // =====================================================

      precioTotal:
        this.redondear(
          precioTotal
        ),


      // =====================================================
      // MARCA
      // =====================================================

      marca:
        this.product.marca

    };


    // =======================================================
    // EVITAR DUPLICADOS
    // =======================================================

    const existingProduct =
      this.products.find(

        product =>

          product.barCode ===
          productData.barCode

      );


    if (
      existingProduct
    ) {

      this.toastr.info(
        'Ya existe este producto en la lista.'
      );

      return;

    }


    // =======================================================
    // AGREGAR
    // =======================================================

    this.products = [

      ...this.products,

      productData

    ];


    console.log(
      'Producto agregado:',
      productData
    );


    console.log(
      'Productos:',
      this.products
    );


    this.toastr.success(
      'Producto agregado a la lista.'
    );


    // =======================================================
    // ESTADO
    // =======================================================

    this.showFormTotal =
      this.products.length > 0;


    this.enviarProductos();


    // =======================================================
    // LIMPIAR
    // =======================================================

    this.resetForm();

  }


  // =========================================================
  // EMITIR PRODUCTOS
  // =========================================================

  private enviarProductos(): void {

    this.productosEmitidos.emit(
      [...this.products]
    );

  }

  private esAlicuotaValida(porcentaje: number): boolean {
    return this.opcionesIva.some(
      opcion => opcion.porcentaje === porcentaje
    );
  }

  private obtenerTipoIva(porcentaje: number): string {
    const opcion = this.opcionesIva.find(
      item => item.porcentaje === porcentaje
    );

    return opcion?.tipo ?? 'IVA_21';
  }


  // =========================================================
  // CREAR PRODUCTO
  // =========================================================

  createProduct(
    event: Event
  ): void {

    event.preventDefault();


    const dialogRef =
      this.dialog.open(

        FormProductComponent,

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

            tipo:
              'createProduct'

          }

        }

      );


    dialogRef
      .afterClosed()
      .subscribe(() => {

        // El usuario puede buscar
        // el producto nuevamente.

      });

  }


  // =========================================================
  // ELIMINAR POR ÍNDICE
  // =========================================================

  eliminarProducto(
    index: number
  ): void {

    if (

      index < 0 ||

      index >=
      this.products.length

    ) {

      return;

    }


    this.products =
      this.products.filter(

        (
          _,
          i
        ) =>

          i !== index

      );


    this.actualizarEstadoLista();


    this.toastr.info(
      'Producto eliminado de la factura.'
    );

  }


  // =========================================================
  // ELIMINAR POR CÓDIGO
  // =========================================================

  deleteProduct(
    barCode: string
  ): void {

    this.products =
      this.products.filter(

        product =>

          product.barCode !==
          barCode

      );


    this.actualizarEstadoLista();


    this.toastr.info(
      'Producto eliminado de la factura.'
    );

  }


  // =========================================================
  // ACTUALIZAR ESTADO
  // =========================================================

  private actualizarEstadoLista(): void {

    this.showFormTotal =
      this.products.length > 0;


    this.enviarProductos();


    this.limpiarTotal.emit(
      this.showFormTotal
    );

  }


  // =========================================================
  // CANCELAR
  // =========================================================

  cancelarBtn(): void {

    this.resetForm();

  }


  // =========================================================
  // RESET FORMULARIO
  // =========================================================

  resetForm(): void {

    if (!this.formProduct) {

      return;

    }


    // =======================================================
    // HABILITAR
    // =======================================================

    this.formProduct
      .get('name')
      ?.enable();


    this.formProduct
      .get('description')
      ?.enable();


    this.formProduct
      .get('stock')
      ?.enable();


    this.formProduct
      .get('iva')
      ?.enable();


    // =======================================================
    // RESET
    // =======================================================

    this.formProduct.reset(

      {

        name:
          '',

        description:
          '',

        price:
          0,

        stock:
          0,

        iva:
          21,

        quantity:
          1,

        totalStock:
          0,

        precioNeto:
          0,

        precioTotal:
          0

      },

      {

        emitEvent:
          false

      }

    );


    // =======================================================
    // LIMPIAR PRODUCTO
    // =======================================================

    this.code =
      '';


    this.product =
      null;


    this.showForm =
      false;


    // =======================================================
    // LIMPIAR DESCUENTOS
    // =======================================================

    this.descuentos =
      [];


    this.nuevoDescuentoPorcentaje =
      null;


    this.nuevoDescuentoDescripcion =
      '';

  }


  // =========================================================
  // RESET COMPLETO
  // =========================================================

  resetListaProductos(): void {

    this.products =
      [];


    this.showFormTotal =
      false;


    this.resetForm();


    this.enviarProductos();


    this.limpiarTotal.emit(
      false
    );

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

}
