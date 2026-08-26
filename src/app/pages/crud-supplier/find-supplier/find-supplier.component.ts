import {
  Component,
  EventEmitter,
  OnInit,
  Output
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  MatFormFieldModule
} from '@angular/material/form-field';

import {
  MatSelectModule
} from '@angular/material/select';

import {
  MatInputModule
} from '@angular/material/input';

import { Supplier } from '../../../interfaces/supplier';

import {
  SupplierService
} from '../../../services/supplier.service';


@Component({
  selector: 'app-find-supplier',

  standalone: true,

  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule
  ],

  templateUrl:
    './find-supplier.component.html',

  styleUrl:
    './find-supplier.component.css'
})
export class FindSupplierComponent
  implements OnInit {


  // =========================================================
  // EVENTOS
  // =========================================================

  /**
   * Emitimos el proveedor completo.
   *
   * Esto permite que el componente padre pueda utilizar:
   *
   * supplier.id
   * supplier.name
   * supplier.cuit
   * supplier.phone
   * etc.
   */
  @Output()
  proveedorSeleccionado =
    new EventEmitter<Supplier | null>();


  /**
   * También dejamos este evento por compatibilidad
   * con el código que ya tenías.
   *
   * Si algún componente actualmente escucha
   * "mensajeEnviado", seguirá funcionando.
   */
  @Output()
  mensajeEnviado =
    new EventEmitter<number>();


  // =========================================================
  // DATOS
  // =========================================================

  suppliers: Supplier[] = [];


  selectedSupplier:
    Supplier | null = null;


  loading = false;


  error = false;


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private supplierService:
      SupplierService
  ) {}


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.getAllSuppliers();

  }


  // =========================================================
  // OBTENER PROVEEDORES
  // =========================================================

  getAllSuppliers(): void {

    this.loading = true;

    this.error = false;


    this.supplierService
      .getAllSuppliers()
      .subscribe({

        next: (
          data: Supplier[]
        ) => {

          this.suppliers =
            Array.isArray(data)
              ? data
              : [];


          this.loading = false;


          console.log(
            'Proveedores cargados:',
            this.suppliers
          );

        },


        error: (
          error
        ) => {

          console.error(
            'Error cargando proveedores:',
            error
          );


          this.suppliers = [];

          this.loading = false;

          this.error = true;

        }

      });

  }


  // =========================================================
  // CAMBIO DE PROVEEDOR
  // =========================================================

  onSupplierChange(): void {

    console.log(
      'Proveedor seleccionado:',
      this.selectedSupplier
    );


    // -------------------------------------------------------
    // SIN PROVEEDOR
    // -------------------------------------------------------

    if (!this.selectedSupplier) {

      this.proveedorSeleccionado.emit(
        null
      );

      return;

    }


    // -------------------------------------------------------
    // EMITIR PROVEEDOR COMPLETO
    // -------------------------------------------------------

    this.proveedorSeleccionado.emit(
      this.selectedSupplier
    );


    // -------------------------------------------------------
    // COMPATIBILIDAD
    // -------------------------------------------------------

    if (this.selectedSupplier.id) {

      this.mensajeEnviado.emit(
        this.selectedSupplier.id
      );

    }

  }


  // =========================================================
  // LIMPIAR SELECCIÓN
  // =========================================================

  limpiarSeleccion(): void {

    this.selectedSupplier = null;

    this.proveedorSeleccionado.emit(
      null
    );

  }

}
