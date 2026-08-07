import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';import { MatDialogRef } from '@angular/material/dialog';
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
    private dialogRef: MatDialogRef<MovimientoFormComponent>
  ) {}

  ngOnInit(): void {
    this.movimientoForm = this.fb.group({
      tipo: ['', Validators.required],
      categoriaMovimiento: ['', Validators.required],
      monto: [null, [Validators.required, Validators.min(1)]],
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

    this.empleadoService.getAll().subscribe({
      next: (data) => (this.empleados = data),
      error: () => this.toastr.error('Error cargando empleados'),
    });
  }

  onTipoChange(): void {
    const tipo = this.movimientoForm.get('tipo')?.value;

    if (tipo === 'EGRESO') {
      this.categoriaOptions = [
        'GASTO_MENOR',

        'PROVEEDOR',

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
    this.movimientoForm.patchValue({
      descripcion: '',
      empleadoId: null,
      tipoSueldo: null,
      mesCorrespondiente: null,
      numeroFactura: '',
      proveedorId: null,
    });
  }

  guardar(): void {
    if (this.movimientoForm.invalid) {
      this.toastr.warning('Completa los campos obligatorios');
      return;
    }

    const movimiento: any = {
      ...this.movimientoForm.value,
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

    console.log('=================================');
    console.log('OBJETO A ENVIAR');
    console.log(movimiento);
    console.log(JSON.stringify(movimiento, null, 2));
    console.log('=================================');
console.log('OBJETO A ENVIAR');
console.log(JSON.stringify(movimiento, null, 2))
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

        this.toastr.error(err.error?.message ?? 'Error al guardar movimiento');
      },
    });
  }
}
