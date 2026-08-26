import { CommonModule } from '@angular/common';
import {
  Component,
  Inject,
  OnInit,
  Optional
} from '@angular/core';

import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { SupplierPaymentService } from '../../../../../services/supplier-payment.service';

import { ProductItemBuy } from '../../../../../interfaces/ProductItemBuy';


@Component({
  selector: 'app-ver-detalle-factura',

  standalone: true,

  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],

  templateUrl:
    './ver-detalle-factura.component.html',

  styleUrl:
    './ver-detalle-factura.component.css'
})
export class VerDetalleFacturaComponent
  implements OnInit {


  // =========================================================
  // ESTADO
  // =========================================================

  cargando = true;

  error = false;


  // =========================================================
  // PRODUCTOS
  // =========================================================

  productos: ProductItemBuy[] = [];


  // =========================================================
  // DATOS RECIBIDOS
  // =========================================================

  factura: any = null;


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(

    private supplierPaymentService:
      SupplierPaymentService,

    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data: any,

    @Optional()
    private dialogRef:
      MatDialogRef<VerDetalleFacturaComponent> | null

  ) {}


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    console.log(
      '===================================='
    );

    console.log(
      'DETALLE FACTURA'
    );

    console.log(
      'Datos recibidos:',
      this.data
    );

    console.log(
      '===================================='
    );


    /*
     * Puede venir:
     *
     * data.updateSupplier
     *
     * o
     *
     * data.id
     *
     * o
     *
     * data.factura.id
     */

    const facturaId =
      this.data?.updateSupplier ??
      this.data?.id ??
      this.data?.factura?.id ??
      this.data?.factura?.facturaId;


    if (!facturaId) {

      console.error(
        '❌ No se recibió ID de factura.'
      );

      this.cargando = false;

      this.error = true;

      return;
    }


    /*
     * Guardamos la factura si fue enviada
     * desde PaySupplier.
     */

    this.factura =
      this.data?.factura ?? null;


    console.log(
      'ID FACTURA:',
      facturaId
    );


    this.getFacturaDetalle(
      Number(facturaId)
    );

  }


  // =========================================================
  // OBTENER DETALLE
  // =========================================================

  getFacturaDetalle(
    id: number
  ): void {

    this.cargando = true;

    this.error = false;


    this.supplierPaymentService
      .getFacturaDetalle(id)
      .subscribe({

        next: (
          detalle: ProductItemBuy[]
        ) => {

          console.log(
            '===================================='
          );

          console.log(
            'PRODUCTOS FACTURA'
          );

          console.log(
            detalle
          );

          console.log(
            '===================================='
          );


          if (
            Array.isArray(detalle)
          ) {

            this.productos =
              detalle;

          } else {

            this.productos = [];

          }


          this.cargando = false;

        },


        error: (
          err
        ) => {

          console.error(
            '❌ Error obteniendo detalle:',
            err
          );


          this.productos = [];

          this.error = true;

          this.cargando = false;

        }

      });

  }


  // =========================================================
  // TOTAL
  // =========================================================

  get totalProductos(): number {

    return this.productos.reduce(

      (
        total,
        producto
      ) => {

        return total +
          Number(
            producto.precioTotal || 0
          );

      },

      0
    );

  }


  // =========================================================
  // CANTIDAD
  // =========================================================

  get cantidadProductos(): number {

    return this.productos.reduce(

      (
        total,
        producto
      ) => {

        return total +
          Number(
            producto.quantity || 0
          );

      },

      0
    );

  }


  // =========================================================
  // CERRAR
  // =========================================================

  cerrar(): void {

    this.dialogRef?.close();

  }

}
