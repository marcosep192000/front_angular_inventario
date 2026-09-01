import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';

import {
  ErrorStateMatcher,
  MatNativeDateModule
} from '@angular/material/core';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { ToastrModule, ToastrService } from 'ngx-toastr';
import { applyDuplicateResourceError } from '../../../shared/forms/duplicate-resource-error';

import { SupplierService } from '../../../services/supplier.service';
import { Supplier } from '../../../interfaces/supplier';


/**
 * =========================================================
 * ERROR STATE MATCHER
 * =========================================================
 */
export class MyErrorStateMatcher
  implements ErrorStateMatcher {

  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {

    const isSubmitted =
      !!form && form.submitted;

    return !!(
      control &&
      control.invalid &&
      (
        control.dirty ||
        control.touched ||
        isSubmitted
      )
    );
  }
}


/**
 * =========================================================
 * COMPONENTE
 * =========================================================
 */
@Component({
  selector: 'app-form-supplier',
  standalone: true,

  imports: [

    CommonModule,

    FormsModule,

    ReactiveFormsModule,

    MatDialogModule,

    MatButtonModule,

    MatIconModule,

    MatInputModule,

    MatSelectModule,

    MatFormFieldModule,

    ToastrModule

  ],

  templateUrl:
    './form-supplier.component.html',

  styleUrl:
    './form-supplier.component.css'
})
export class FormSupplierComponent
  implements OnInit {


  // =========================================================
  // FORMULARIO
  // =========================================================

  formGroup!: FormGroup;


  // =========================================================
  // ESTADO
  // =========================================================

  loading = false;

  cargandoProveedor = false;


  // =========================================================
  // DATOS
  // =========================================================

  supplier: Supplier | null = null;


  // =========================================================
  // MATCHER
  // =========================================================

  matcher =
    new MyErrorStateMatcher();


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(

    private supplierService:
      SupplierService,

    @Inject(MAT_DIALOG_DATA)
    public data: any,

    public dialogRef:
      MatDialogRef<FormSupplierComponent>,

    private fb:
      FormBuilder,

    private toast:
      ToastrService

  ) {

    this.crearFormulario();

  }


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    if (this.modoEdicion) {

      this.cargarProveedor();

    }

  }


  // =========================================================
  // CREAR FORMULARIO
  // =========================================================

  private crearFormulario(): void {

    this.formGroup =
      this.fb.group({

        name: [

          '',

          [
            Validators.required,
            Validators.maxLength(80)
          ]

        ],

        cuit: [

          '',

          [
            Validators.required,
            Validators.maxLength(12),
            Validators.pattern(/^[0-9]+$/)
          ]

        ],

        phone: [

          '',

          [
            Validators.required,
            Validators.maxLength(14),
            Validators.pattern(/^[0-9]+$/)
          ]

        ],

        address: [

          '',

          [
            Validators.maxLength(80)
          ]

        ],

        contact: [

          '',

          [
            Validators.maxLength(20)
          ]

        ],

        email: [

          '',

          [
            Validators.required,
            Validators.email,
            Validators.maxLength(100)
          ]

        ]

      });

  }


  // =========================================================
  // MODO EDICIÓN
  // =========================================================

  get modoEdicion(): boolean {

    return (
      this.data?.tipo ===
      'updateSupplier'
    );

  }


  // =========================================================
  // TÍTULO
  // =========================================================

  get titulo(): string {

    return this.modoEdicion
      ? 'Actualizar Proveedor'
      : 'Registrar Proveedor';

  }


  // =========================================================
  // CARGAR PROVEEDOR
  // =========================================================

  private cargarProveedor(): void {

    const id =
      this.data?.updateSupplier;

    if (!id) {

      this.toast.error(
        'No se recibió el proveedor a modificar.'
      );

      this.dialogRef.close();

      return;

    }


    this.cargandoProveedor = true;


    this.supplierService
      .findById(id)
      .subscribe({

        next: (supplier) => {

          this.supplier =
            supplier;

          this.formGroup.patchValue({

            name:
              supplier.name ?? '',

            cuit:
              supplier.cuit ?? '',

            phone:
              supplier.phone ?? '',

            address:
              supplier.address ?? '',

            contact:
              supplier.contact ?? '',

            email:
              supplier.email ?? ''

          });

          this.cargandoProveedor = false;

        },


        error: (error:
          HttpErrorResponse) => {

          console.error(
            'Error al cargar proveedor:',
            error
          );

          this.cargandoProveedor = false;

          this.toast.error(
            this.obtenerMensajeError(
              error,
              'No se pudo cargar el proveedor.'
            )
          );

          this.dialogRef.close();

        }

      });

  }


  // =========================================================
  // GUARDAR
  // =========================================================

  save(): void {

    if (this.loading) {

      return;

    }


    if (!this.validarFormulario()) {

      return;

    }


    this.loading = true;


    const supplier:
      Supplier =
      this.obtenerDatosFormulario();


    this.supplierService
      .createSupplier(supplier)
      .subscribe({

        next: (data) => {

          this.loading = false;

          this.toast.success(
            'Proveedor guardado correctamente.'
          );

          this.dialogRef.close(
            data
          );

        },


        error: (
          error: HttpErrorResponse
        ) => {

          this.loading = false;

          this.mostrarError(
            error,
            'No se pudo guardar el proveedor.'
          );

        }

      });

  }


  // =========================================================
  // ACTUALIZAR
  // =========================================================

  update(): void {

    if (this.loading) {

      return;

    }


    if (!this.validarFormulario()) {

      return;

    }


    const id =
      this.data?.updateSupplier;


    if (!id) {

      this.toast.error(
        'No se encontró el ID del proveedor.'
      );

      return;

    }


    this.loading = true;


    const supplier:
      Supplier =
      this.obtenerDatosFormulario();


    this.supplierService
      .update(
        id,
        supplier
      )
      .subscribe({

        next: (data) => {

          this.loading = false;

          this.toast.success(
            'Proveedor actualizado correctamente.'
          );

          this.dialogRef.close(
            data
          );

        },


        error: (
          error: HttpErrorResponse
        ) => {

          this.loading = false;

          this.mostrarError(
            error,
            'No se pudo actualizar el proveedor.'
          );

        }

      });

  }


  // =========================================================
  // VALIDAR FORMULARIO
  // =========================================================

  private validarFormulario(): boolean {

    if (this.formGroup.valid) {

      return true;

    }


    this.formGroup.markAllAsTouched();


    this.toast.warning(
      'Revisá los campos obligatorios del formulario.'
    );


    return false;

  }


  // =========================================================
  // OBTENER DATOS
  // =========================================================

  private obtenerDatosFormulario():
    Supplier {

    const value =
      this.formGroup.getRawValue();


    return {

      name:
        value.name?.trim(),

      cuit:
        value.cuit?.trim(),

      phone:
        value.phone?.trim(),

      address:
        value.address?.trim(),

      contact:
        value.contact?.trim(),

      email:
        value.email?.trim()

    };

  }


  // =========================================================
  // INPUT NUMÉRICO
  // =========================================================

  onInputChange(
    event: Event,
    controlName: string
  ): void {

    const input =
      event.target as HTMLInputElement;


    const value =
      input.value.replace(
        /[^0-9]/g,
        ''
      );


    input.value =
      value;


    this.formGroup
      .get(controlName)
      ?.setValue(
        value,
        {
          emitEvent: false
        }
      );

  }


  // =========================================================
  // ERROR DE MATERIAL
  // =========================================================

  isErrorState(
    control: FormControl | null,
    form:
      FormGroupDirective |
      NgForm |
      null
  ): boolean {

    const isSubmitted =
      !!form && form.submitted;


    return !!(
      control &&
      control.invalid &&
      (
        control.dirty ||
        control.touched ||
        isSubmitted
      )
    );

  }


  // =========================================================
  // CANCELAR
  // =========================================================

  cancel(): void {

    if (this.loading) {

      return;

    }


    this.dialogRef.close();

  }


  // =========================================================
  // MENSAJE DE ERROR
  // =========================================================

  private mostrarError(
    error: HttpErrorResponse,
    mensajeDefault: string
  ): void {

    console.error(
      'Error proveedor:',
      error
    );


    const duplicate = applyDuplicateResourceError(error, this.formGroup);
    this.toast.error(
      duplicate ||
      this.obtenerMensajeError(
        error,
        mensajeDefault
      )
    );

  }


  // =========================================================
  // OBTENER MENSAJE DEL BACKEND
  // =========================================================

  private obtenerMensajeError(
    error: HttpErrorResponse,
    mensajeDefault: string
  ): string {

    /*
     * Si el backend devuelve:
     *
     * {
     *   "message": "El CUIT ya existe."
     * }
     *
     * mostramos ese mensaje.
     */

    if (
      error.error &&
      typeof error.error === 'object' &&
      error.error.message
    ) {

      return error.error.message;

    }


    if (
      error.error &&
      typeof error.error === 'string'
    ) {

      return error.error;

    }


    switch (error.status) {

      case 400:

        return (
          'Los datos enviados no son válidos.'
        );


      case 404:

        return (
          'El proveedor no existe.'
        );


      case 409:

        return (
          'El CUIT ya está registrado.'
        );


      case 500:

        return (
          'Error interno del servidor.'
        );


      default:

        return mensajeDefault;

    }

  }

}
