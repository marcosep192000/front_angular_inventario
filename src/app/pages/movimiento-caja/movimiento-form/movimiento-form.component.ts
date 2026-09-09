import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { MovimientoCajaService } from '../../../services/movimiento-caja.service';
import { EmpleadoService } from '../../../services/empleado.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

export function mensajeErrorMovimiento(err: any): string {
  const message = err?.error?.message ?? err?.error?.error?.message ?? err?.error?.error;
  return typeof message === 'string' && message.trim() ? message.trim() : 'No se pudo registrar el movimiento.';
}

export function mensajeErrorEmpleados(err: any): string {
  const message = err?.error?.message ?? err?.error?.error?.message ?? err?.error?.error;
  return typeof message === 'string' && message.trim() ? message.trim() : 'No se pudieron cargar los empleados.';
}

@Component({
  selector: 'app-movimiento-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatDialogModule,
    MatInputModule,
    MatTooltipModule,
    MatCardModule,
    ToastrModule,
  ],
  templateUrl: './movimiento-form.component.html',
  styleUrls: ['./movimiento-form.component.css'],
})
export class MovimientoFormComponent implements OnInit {
  movimientoForm!: FormGroup;
  empleados: any[] = [];
  empleadosCargados = false;
  cargandoEmpleados = false;

  tipoMovimientoOptions = ['INGRESO', 'EGRESO'];
  categoriaOptions: string[] = [];

formaPagoOptions = [
  'EFECTIVO',
  'TRANSFERENCIA',
  'DEBITO',
  'CREDITO',
  'MERCADO_PAGO',
  'CHEQUE',
  'CUENTA_CORRIENTE',
  'OTRO'
];


  constructor(
    private fb: FormBuilder,
    private movimientoService: MovimientoCajaService,
    private empleadoService: EmpleadoService,
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<MovimientoFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { puntoCajaId?: number | null }
  ) {}

  ngOnInit(): void {
    this.movimientoForm = this.fb.group({
      tipo: ['', Validators.required],
      categoriaMovimiento: ['', Validators.required],
      monto: [null, [Validators.required, Validators.min(0.01)]],
      descripcion: [''],

medioPago: [null ],

      // Sueldos
      empleadoId: [null],
      tipoSueldo: [null],
      mesCorrespondiente: [null],
      anioCorrespondiente: [new Date().getFullYear()],

      // Proveedor
      numeroFactura: [''],
      proveedorId: [null],
    });

  }

  onTipoChange(): void {
    const tipo = this.movimientoForm.get('tipo')?.value;

    if (tipo === 'EGRESO') {
      this.categoriaOptions = [
        'GASTO_MENOR',
        'PAGO_SUELDO',
        'ADELANTO',
        'AJUSTE_NEGATIVO',
      ];
    } else if (tipo === 'INGRESO') {
      this.categoriaOptions = [
        'APORTE_CAPITAL',

        'OTROS_INGRESOS',

        'PRESTAMO_RECIBIDO',

        'REINTEGRO',

        'AJUSTE_POSITIVO',
      ];
    } else {
      this.categoriaOptions = [];
    }

    this.movimientoForm.patchValue({
      categoriaMovimiento: null,
    });
  }

  onCategoriaChange(): void {
    const categoria = this.movimientoForm.get('categoriaMovimiento')?.value;
    this.movimientoForm.patchValue({
      descripcion: '',
      empleadoId: null,
      tipoSueldo: null,
      mesCorrespondiente: null,
      numeroFactura: '',
      proveedorId: null,
    });
    const empleadoControl = this.movimientoForm.get('empleadoId');
    if (this.requiereEmpleado(categoria)) {
      empleadoControl?.setValidators(Validators.required);
      this.cargarEmpleados();
    } else {
      empleadoControl?.clearValidators();
    }
    empleadoControl?.updateValueAndValidity();
  }

  requiereEmpleado(categoria = this.movimientoForm.get('categoriaMovimiento')?.value): boolean {
    return categoria === 'PAGO_SUELDO' || categoria === 'ADELANTO';
  }

  private cargarEmpleados(): void {
    if (this.empleadosCargados || this.cargandoEmpleados) return;
    this.cargandoEmpleados = true;
    this.empleadoService.getAll().subscribe({
      next: data => {
        this.empleados = Array.isArray(data) ? data : [];
        this.empleadosCargados = true;
        this.cargandoEmpleados = false;
      },
      error: err => {
        this.cargandoEmpleados = false;
        this.toastr.error(mensajeErrorEmpleados(err));
      },
    });
  }

  cancelar(): void { this.dialogRef.close(); }

  guardar(): void {
    if (this.requiereEmpleado() && !this.movimientoForm.get('empleadoId')?.value) {
      this.toastr.warning('Seleccioná un empleado para registrar el pago de sueldo.');
      return;
    }
    if (this.movimientoForm.invalid) {
      this.toastr.warning('Completa los campos obligatorios');
      return;
    }

    const movimiento: any = {
      ...this.movimientoForm.value,
      puntoCajaId: this.data?.puntoCajaId ?? null,
    };

    // ====================================================
    // ASIGNAR EL TIPO QUE NECESITA JACKSON
    // ====================================================

    switch (movimiento.categoriaMovimiento) {
      case 'GASTO_MENOR':
        movimiento.tipo_movimiento = 'GASTO_MENOR';
        break;

      case 'PROVEEDOR':
        movimiento.tipo_movimiento = 'PROVEEDOR';
        break;

      case 'PAGO_SUELDO':
        movimiento.tipo_movimiento = 'SUELDO';
        movimiento.tipoSueldo = 'SUELDO_MENSUAL';
        break;

      case 'ADELANTO':
        movimiento.tipo_movimiento = 'SUELDO';
        movimiento.tipoSueldo = 'ADELANTO';
        break;

      case 'APORTE_CAPITAL':
      case 'OTROS_INGRESOS':
      case 'PRESTAMO_RECIBIDO':
      case 'REINTEGRO':
      case 'AJUSTE_POSITIVO':
      case 'AJUSTE_NEGATIVO':
        movimiento.tipo_movimiento = 'AJUSTE_CAJA';
        break;

      default:
        this.toastr.error('Categoría de movimiento inválida');
        return;
    }

    if (movimiento.tipo_movimiento === 'AJUSTE_CAJA') {
  movimiento.observacion = movimiento.descripcion;
  delete movimiento.descripcion;
}

    this.movimientoService.create(movimiento).subscribe({
      next: () => {
        this.toastr.success('Movimiento registrado correctamente');
 this.dialogRef.close(true); // Cierra el diálogo y pasa true para indicar éxito
        this.movimientoForm.reset();

        this.movimientoForm.patchValue({
          anioCorrespondiente: new Date().getFullYear(),
        });
      },

      error: (err) => {
        console.error(err);

        this.toastr.error(mensajeErrorMovimiento(err));
      },
    });
  }
}
