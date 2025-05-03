import { Component, Inject, OnInit } from '@angular/core';
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
  catchError,
  map,
  Observable,
  of,
  switchMap,
  throwError
} from 'rxjs';
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
      tel: ['', [Validators.required, Validators.maxLength(14), Validators.pattern('[0-9]*')]],
      lastName: ['', [Validators.required, Validators.maxLength(20)]],
      address: ['', [Validators.required, Validators.maxLength(40)]],
      email: this.emailFormControl
    });
  }

  ngOnInit(): void {
    if (this.data.updateClient != null) {
      this.clientService.getClientById(this.data.updateClient).subscribe((datos: any) => {
        this.formGroup.patchValue({
          name: datos.name,
          lastName: datos.lastName,
          cuit: datos.cuit,
          address: datos.address,
          tel: datos.tel,
          email: datos.email
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
    const clientCuit = this.formGroup.get('cuit')?.value;

    this.existeCliente(clientCuit)
      .pipe(
        switchMap((existe) => {
          if (existe) {
            this.toastr.error('El CUIT ingresado ya existe.');
            return throwError(() => new Error('El CUIT ingresado ya existe.'));
          }
          return this.clientService.addClient(clientData);
        })
      )
      .subscribe({
        next: (data) => {
          this.dialogRef.close(data);
          this.toastr.success('Cliente guardado con éxito!', '', {
            timeOut: 5000,
            positionClass: 'toast-bottom-right',
          });
        },
        error: (error) => {
          console.error('Error al guardar el cliente:', error);
          this.toastr.error('Hubo un error al guardar el cliente.', '', {
            timeOut: 5000,
            positionClass: 'toast-bottom-right',
          });
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
        (error) => {
          console.error('Error al actualizar el cliente:', error);
          this.toastr.error('Hubo un error al actualizar el cliente.', '', {
            timeOut: 5000,
            positionClass: 'toast-bottom-right',
          });
        }
      );
    }
  }

  existeCliente(cuit: string): Observable<boolean> {
    return this.clientService.getClientByDni(cuit).pipe(
      map((client) => !!client),
      catchError((error) => {
        console.error('Error al buscar el cliente por CUIT:', error);
        return of(false);
      })
    );
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
  
}
