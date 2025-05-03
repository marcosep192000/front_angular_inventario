import { Component, Inject, OnInit } from '@angular/core';
import { IconComponent } from '../../shared/dasboard/icon/icon.component';
import { ClientService } from '../../services/client.service';
import { CommonModule } from '@angular/common';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { FormClientComponent } from '../crud-client/form-client/form-client.component';
import { CtaCteService } from '../../services/cta-cte.service';
import { publicDecrypt } from 'crypto';
import { Client } from '../../interfaces/Client';
import { DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'app-crud-cta-cte-cliente',
  standalone: true,
  imports: [
    IconComponent,
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
    ToastrModule,
    IconComponent,
  ],
  templateUrl: './crud-cta-cte-cliente.component.html',
  styleUrl: './crud-cta-cte-cliente.component.css',
})
export class CrudCtaCteClienteComponent implements OnInit {
  formGroup!: FormGroup;
  dataClient: Client[] = [];
  getDataClient: null = null;
  agregarCuentaCorriente = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private clientService: ClientService,
    private toast: ToastrService,
    public dialogRef: MatDialogRef<FormClientComponent>,
    public dialog: MatDialog,
    private CtaCteService: CtaCteService,
    private fb: FormBuilder
  ) {
    this.formGroup = this.fb.group({
      montoMaximoDeCtaCte: [],
    });
  }

  ngOnInit(): void {}

  onInputChange(event: any, controlName: string) {
    const input = event.target.value.replace(/[^0-9]/g, '');
    this.formGroup.get(controlName)?.setValue(input);
  }
  save(id: number) {
    const data = this.formGroup.value;
    if (this.formGroup.valid) {
      this.clientService.guardarCuentaCorriente(id, data).subscribe({
        next: (res) => console.log('Cuenta creada con exito', res),
        error: (err) => console.error('error el crear cuta corriente', err),
      }); this.dialogRef.close();
    }
  }
  cancel() {
    this.dialogRef.close();
  }
}
