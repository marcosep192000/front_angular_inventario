import { Component, Inject, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Client } from '../../../interfaces/Client';
import { ClientService } from '../../../services/client.service';
import {
  CommonModule
} from '@angular/common';
import {
  MatButtonModule
} from '@angular/material/button';
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
MatSlideToggleChange,
  MatSlideToggleModule
} from '@angular/material/slide-toggle';
import {
  ChangeDetectionStrategy
} from '@angular/core';
import {
  MatDatepickerModule
} from '@angular/material/datepicker';
import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import {
  MatDialogModule
} from '@angular/material/dialog';
import {
  ToastrModule
} from 'ngx-toastr';
import {
  IconComponent
} from '../../../shared/dasboard/icon/icon.component';
import { applyDuplicateResourceError } from '../../../shared/forms/duplicate-resource-error';

@Component({
  selector: 'app-form-client',
  standalone: true,
  imports: [
    MatDatepickerModule,
    ToastrModule,
    MatInputModule,
    CommonModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    FormsModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    IconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './form-client.component.html',
  styleUrl: './form-client.component.css',
})
export class FormClientComponent implements OnInit {
onToggleChange($event: MatSlideToggleChange) {
throw new Error('Method not implemented.');
}
onInputChange($event: Event,arg1: string) {
throw new Error('Method not implemented.');
}
  formGroup!: FormGroup;
  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<FormClientComponent>,
    private fb: FormBuilder,
    private clientService: ClientService,
    private toastr: ToastrService
  ) {
    this.formGroup = this.fb.group({
      cuit: ['', [Validators.required, Validators.maxLength(12), Validators.pattern('[0-9]*')]],
      name: ['', [Validators.required, Validators.maxLength(20)]],
      tel: ['', [
        Validators.required,
        Validators.maxLength(20),
        Validators.pattern(/^\+?[0-9\s()-]{8,20}$/)
      ]],
      lastName: ['', [Validators.required, Validators.maxLength(20)]],
      address: ['', [Validators.required, Validators.maxLength(80)]],
      email: this.emailFormControl,
      condicionIva: ['CONSUMIDOR_FINAL']
    });
  }

  ngOnInit(): void {
    if (this.data.updateClient != null) {
      this.clientService.obtenerClientePorId(this.data.updateClient).subscribe((datos: any) => {
        this.formGroup.patchValue({
          name: datos.name,
          lastName: datos.lastName,
          cuit: datos.cuit,
          address: datos.address,
          tel: datos.tel,
          email: datos.email,
          condicionIva: datos.condicionIva || 'CONSUMIDOR_FINAL'
        });
      });
    }
  }

  save(): void {
    if (this.formGroup.invalid) {
      this.toastr.error('Por favor, complete todos los campos requeridos!', '', {
        timeOut: 5000,
        positionClass: 'toast-bottom-right',
      });
      return;
    }

    const clientData = this.formGroup.value;
    this.clientService.addClient(clientData)
      .subscribe({
        next: (data) => {
          this.dialogRef.close(data);
          this.toastr.success('Cliente guardado con éxito!', '', {
            timeOut: 5000,
            positionClass: 'toast-bottom-right',
          });
        },
        error: (error) => {
          this.handleSaveError(error);
        },
      });
  }

  update(): void {
    if (this.formGroup.valid) {
      const clientData = this.formGroup.value;

      this.clientService.updateClient(this.data.updateClient, clientData).subscribe(
        (updatedClient) => {
          this.dialogRef.close(updatedClient);
          this.toastr.success('Cliente actualizado con éxito!', '', {
            timeOut: 5000,
            positionClass: 'toast-bottom-right',
          });
        },
        (error) => this.handleSaveError(error)
      );
    }
  }

  cancel(){
    this.dialogRef.close(); 
  }
  onlyAllowNumbers(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete'];
    const isNumber = /^[0-9]$/.test(event.key);
  
    if (!isNumber && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  private handleSaveError(error: HttpErrorResponse): void { const duplicate=applyDuplicateResourceError(error,this.formGroup); this.toastr.error(duplicate||error.error?.message||error.error?.error||'No se pudo guardar el cliente.'); }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/[^0-9+\s()-]/g, '').slice(0, 20);
    this.formGroup.get('tel')?.setValue(value, { emitEvent: false });
    input.value = value;
  }
  
}
