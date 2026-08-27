import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ToastrService } from 'ngx-toastr';
import { ClientService } from '../../services/client.service';

@Component({
  selector: 'app-crud-cta-cte-cliente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule, MatIconModule, MatInputModule],
  templateUrl: './crud-cta-cte-cliente.component.html',
  styleUrl: './crud-cta-cte-cliente.component.css',
})
export class CrudCtaCteClienteComponent {
  guardando = false;
  readonly formGroup = this.fb.group({
    montoMaximoDeCtaCte: [null as number | null, [Validators.required, Validators.min(0)]],
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { altaClient: number },
    private readonly dialogRef: MatDialogRef<CrudCtaCteClienteComponent>,
    private readonly clientService: ClientService,
    private readonly toastr: ToastrService,
    private readonly fb: FormBuilder,
  ) {}

  guardar(): void {
    if (this.formGroup.invalid || this.guardando) {
      this.formGroup.markAllAsTouched();
      return;
    }
    this.guardando = true;
    const montoMaximoDeCtaCte = Number(this.formGroup.controls.montoMaximoDeCtaCte.value);
    this.clientService.guardarCuentaCorriente(this.data.altaClient, { montoMaximoDeCtaCte }).subscribe({
      next: () => {
        this.toastr.success('Cuenta corriente creada correctamente.');
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.guardando = false;
        this.toastr.error(error?.error?.error || 'No se pudo crear la cuenta corriente.');
      },
    });
  }

  cancelar(): void { this.dialogRef.close(false); }
}
