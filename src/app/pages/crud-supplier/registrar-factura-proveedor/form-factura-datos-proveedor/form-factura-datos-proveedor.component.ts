import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
} from '@angular/material/core';
import {
  MatDatepickerModule,
} from '@angular/material/datepicker';
import {
  MatDialog,
  MatDialogModule,
} from '@angular/material/dialog';
import {
  MatFormFieldModule,
} from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import {
  ToastrModule,
  ToastrService,
} from 'ngx-toastr';

import {
  SupplierService,
} from '../../../../services/supplier.service';

import {
  Supplier,
} from '../../../../interfaces/supplier';

import {
  Subscription,
} from 'rxjs';


// ============================================================
// FORMATO DE FECHAS
// ============================================================

const CUSTOM_DATE_FORMATS = {

  parse: {
    dateInput: 'DD/MM/YYYY',
  },

  display: {

    dateInput: 'DD/MM/YYYY',

    monthYearLabel: 'MMM YYYY',

    dateA11yLabel: 'LL',

    monthYearA11yLabel: 'MMMM YYYY',
  },
};


@Component({
  selector: 'app-form-factura-datos-proveedor',

  standalone: true,

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

    ToastrModule,
  ],

  providers: [

    {
      provide: MAT_DATE_LOCALE,
      useValue: 'es-AR',
    },

    {
      provide: MAT_DATE_FORMATS,
      useValue: CUSTOM_DATE_FORMATS,
    },
  ],

  changeDetection: ChangeDetectionStrategy.OnPush,

  templateUrl:
    './form-factura-datos-proveedor.component.html',

  styleUrl:
    './form-factura-datos-proveedor.component.css',
})
export class FormFacturaDatosProveedorComponent
  implements OnInit, OnDestroy {


  // ==========================================================
  // OUTPUT
  // ==========================================================

  @Output()
  datosEmitidos =
    new EventEmitter<any>();


  // ==========================================================
  // INPUT
  // ==========================================================

  @Input()
  factura: any;


  // ==========================================================
  // FORMULARIO
  // ==========================================================

  formInvoice!: FormGroup;


  // ==========================================================
  // DATOS
  // ==========================================================

  suppliers: Supplier[] = [];

  paymentTermsList: string[] = [];

  selectedPaymentTerm = '';

  startDate =
    new Date(1990, 0, 1);


  private subscription?: Subscription;


  // ==========================================================
  // CONSTRUCTOR
  // ==========================================================

  constructor(

    private fb: FormBuilder,

    private toastr: ToastrService,

    private dialog: MatDialog,

    private supplierService: SupplierService,

  ) {}


  // ==========================================================
  // INIT
  // ==========================================================

  ngOnInit(): void {

    this.crearFormulario();

    this.cargarProveedores();

    this.cargarFormasPago();

    this.configurarCambios();

    this.emitirDatos();
  }


  // ==========================================================
  // CREAR FORMULARIO
  // ==========================================================

  private crearFormulario(): void {

    this.formInvoice =
      this.fb.group({

        idInvoice: [
          '',
          Validators.required,
        ],

        dateOfEntry: [
          new Date(),
          Validators.required,
        ],

        dueDate: [
          null,
        ],

        tipoDeCuentaEnum: [
          '',
          Validators.required,
        ],

        provider: [
          null,
          Validators.required,
        ],

        amount: [
          0,
        ],

        ivaTotal: [
          0,
        ],

        montoTotal: [
          0,
        ],

        invoiceDetailsProviders: [
          [],
        ],
      });
  }


  // ==========================================================
  // CARGAR PROVEEDORES
  // ==========================================================

  private cargarProveedores(): void {

    this.supplierService
      .getAllSuppliers()
      .subscribe({

        next: (data) => {

          this.suppliers = data;
        },

        error: (error) => {

          console.error(
            'Error al cargar proveedores:',
            error
          );

          this.toastr.error(
            'No se pudieron cargar los proveedores.'
          );
        },
      });
  }


  // ==========================================================
  // CARGAR FORMAS DE PAGO
  // ==========================================================

  private cargarFormasPago(): void {

    this.supplierService
      .getPayMethod()
      .subscribe({

        next: (data) => {

          this.paymentTermsList =
            data ?? [];
        },

        error: (error) => {

          console.error(
            'Error al cargar formas de pago:',
            error
          );

          this.toastr.error(
            'No se pudieron cargar las formas de pago.'
          );
        },
      });
  }


  // ==========================================================
  // ESCUCHAR CAMBIOS
  // ==========================================================

  private configurarCambios(): void {

    this.subscription =
      this.formInvoice.valueChanges
        .subscribe(() => {

          this.actualizarCondicionPago();

          this.emitirDatos();

        });
  }


  // ==========================================================
  // CONDICIÓN DE PAGO
  // ==========================================================

  private actualizarCondicionPago(): void {

    const condicion =
      this.formInvoice
        .get('tipoDeCuentaEnum')
        ?.value;


    this.selectedPaymentTerm =
      condicion ?? '';


    // --------------------------------------------------------
    // CONTADO
    // --------------------------------------------------------

    if (condicion === 'CONTADO') {

      const hoy =
        new Date();


      this.formInvoice.patchValue(
        {
          dueDate: hoy,
        },
        {
          emitEvent: false,
        }
      );

      return;
    }


    // --------------------------------------------------------
    // CUENTA CORRIENTE
    // --------------------------------------------------------

    if (condicion === 'CTA_CTE') {

      this.formInvoice.patchValue(
        {
          dueDate: null,
        },
        {
          emitEvent: false,
        }
      );
    }
  }


  // ==========================================================
  // EMITIR DATOS
  // ==========================================================

  private emitirDatos(): void {

    if (!this.formInvoice) {
      return;
    }


    const datos =
      this.formInvoice.getRawValue();


    this.datosEmitidos.emit(datos);
  }


  // ==========================================================
  // RECIBIR FORMA DE PAGO DESDE COMPONENTE HIJO
  // ==========================================================

  recibirIdMensajeFormaPago(
    mensaje: string
  ): void {

    this.formInvoice.patchValue({

      tipoDeCuentaEnum:
        mensaje,

    });
  }


  // ==========================================================
  // CAMBIO MANUAL DE FORMA DE PAGO
  // ==========================================================

  onPaymentTermChange(
    selected: string
  ): void {

    this.formInvoice.patchValue({

      tipoDeCuentaEnum:
        selected,

    });
  }


  // ==========================================================
  // VALIDAR
  // ==========================================================

  validarFormulario(): boolean {

    if (this.formInvoice.invalid) {

      this.formInvoice.markAllAsTouched();

      this.toastr.error(
        'Completa los datos obligatorios de la factura.'
      );

      return false;
    }


    const proveedor =
      this.formInvoice
        .get('provider')
        ?.value;


    if (!proveedor) {

      this.toastr.error(
        'Debes seleccionar un proveedor.'
      );

      return false;
    }


    const condicion =
      this.formInvoice
        .get('tipoDeCuentaEnum')
        ?.value;


    if (!condicion) {

      this.toastr.error(
        'Debes seleccionar una forma de pago.'
      );

      return false;
    }


    return true;
  }


  // ==========================================================
  // GUARDAR DATOS
  // ==========================================================

  saveInvoiceSupplier(): boolean {

    return this.validarFormulario();
  }


  // ==========================================================
  // RESET
  // ==========================================================

  resetDatosProveedor(): void {

    this.formInvoice.reset({

      idInvoice: '',

      dateOfEntry:
        new Date(),

      dueDate: null,

      provider: null,

      tipoDeCuentaEnum: '',

      amount: 0,

      ivaTotal: 0,

      montoTotal: 0,

      invoiceDetailsProviders: [],
    });


    this.selectedPaymentTerm = '';

    this.emitirDatos();
  }


  // ==========================================================
  // DESTRUIR
  // ==========================================================

  ngOnDestroy(): void {

    this.subscription?.unsubscribe();
  }
}
