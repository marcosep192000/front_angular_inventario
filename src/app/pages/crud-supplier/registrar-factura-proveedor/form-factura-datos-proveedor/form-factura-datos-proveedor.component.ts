import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { FindSupplierComponent } from '../../find-supplier/find-supplier.component';
import { PaymentTermsComponent } from '../../payment-terms/payment-terms.component';
import { HttpClient } from '@angular/common/http';
import { ProductService } from '../../../../services/product.service';
import { SupplierPaymentService } from '../../../../services/supplier-payment.service';
// Formato de fechas personalizado
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
    FindSupplierComponent,
    PaymentTermsComponent,
  ],
  providers: [
      { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }, // Configura el idioma de las fechas
      { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS }, // Usa el formato personalizado
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './form-factura-datos-proveedor.component.html',
  styleUrl: './form-factura-datos-proveedor.component.css',
})
export class FormFacturaDatosProveedorComponent implements OnInit {
  @Output() datosEmitidos = new EventEmitter<any>();
  formInvoice!: FormGroup;
  selectedPaymentTerm: string = 'CONTADO';
  idProveedorRecibido: number | null = null;
  recibirIdMensaje(mensaje: number) {
    this.idProveedorRecibido = mensaje;
    // Actualiza el valor del campo 'provider' en el formulario cuando se recibe el ID
    this.formInvoice.patchValue({
      provider: this.idProveedorRecibido,
    });
  }
    recibirIdMensajeFormaPago(mensaje:string){ 
      this.selectedPaymentTerm = mensaje; 
      // Actualiza el valor del campo 'paymentTerms' en el formulario cuando se recibe el código de la forma de pago
      this.formInvoice.patchValue({
        paymentTerms: mensaje,
        
      });console.log(mensaje);
    }
  
  constructor(
    private productService: ProductService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private supplierPamentService: SupplierPaymentService
  ) {}
  forms() {
    // formulario para realizar la factura
    this.formInvoice = this.fb.group({
      idInvoice: ['',Validators.required],
      dateOfEntry: ['',Validators.required],
      dueDate: [''],
    
      provider: [this.idProveedorRecibido ?? '', Validators.required], // Asegura que el proveedor sea opcional hasta que se reciba el ID
      paymentStatus: [false],
      amount: [0, Validators.required],
      invoiceDetailsProviders: [[]],
    });

    this.formInvoice
      .get('invoiceDetailsProviders')
      ?.valueChanges.subscribe((details) => {
        const total = details.reduce(
          (sum: number, item: any) => sum + item.subTotal,
          0
        );
        this.formInvoice.patchValue({ amount: total });
      });
    this.checkPaymentTerm(); 
  }

  checkPaymentTerm() {
    if (this.selectedPaymentTerm === 'CONTADO') {  // Si el pago es contado
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      this.formInvoice.patchValue({
        dueDate: formattedDate,  // Establecer dueDate con la fecha actual
      });
    } else {
      // Si no es 'CTA_CTE', puedes dejar el campo dueDate vacío o asignar una fecha diferente
      this.formInvoice.patchValue({
        dueDate: '', // Dejar vacío si no es contado
      });
    }
  }
  ngOnInit(): void {
    this.forms();
    this.formInvoice.valueChanges.subscribe((variables) => { 
      if (this.formInvoice.valid) {
        this.datosEmitidos.emit(variables);
      } else {
//this.saveInvoiceSupplier();
      }
    })
  }
  saveInvoiceSupplier(): void {
    if (this.formInvoice.invalid) {
      let errorMessage = 'Por favor, completa todos los campos obligatorios.';
      for (const controlName in this.formInvoice.controls) {
        const control = this.formInvoice.controls[controlName];
        if (control.invalid) {
          if (control.errors?.['required']) {
            errorMessage = `El campo ${controlName} es obligatorio.`;
          } else if (control.errors?.['minlength']) {
            errorMessage = `El campo ${controlName} debe tener al menos ${control.errors['minlength'].requiredLength} caracteres.`;
          } else if (control.errors?.['maxlength']) {
            errorMessage = `El campo ${controlName} no puede tener más de ${control.errors['maxlength'].requiredLength} caracteres.`;
          }
          break;
        }
      }
      this.toastr.error(errorMessage);
      return;
    }
  }
  onPaymentTermChange(selected: string): void {
    this.selectedPaymentTerm = selected;
  }
}
