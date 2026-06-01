import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';
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
  imports: [    CommonModule,
      FormsModule,
      ReactiveFormsModule,
      MatButtonModule,
      MatFormFieldModule,
      MatIconModule,
      MatDialogModule,
      MatInputModule,
      MatTooltipModule,
      ToastrModule,MatCardModule],
  templateUrl: './movimiento-form.component.html',
  styleUrls: ['./movimiento-form.component.css']
})
export class MovimientoFormComponent implements OnInit {
  movimientoForm!: FormGroup;
  empleados: any[] = [];
  tipoMovimientoOptions = ['INGRESO', 'EGRESO'];
  categoriaOptions: string[] = [];

  constructor(
    private fb: FormBuilder,
    private movimientoService: MovimientoCajaService,
    private empleadoService: EmpleadoService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.movimientoForm = this.fb.group({
      tipo: ['', Validators.required],
      categoriaMovimiento: ['', Validators.required],
      monto: [null, [Validators.required, Validators.min(1)]],
      descripcion: [''],

      // Campos de sueldos
      empleadoId: [null],
      tipoSueldo: [null],
      mesCorrespondiente: [null],
      anioCorrespondiente: [new Date().getFullYear()],
      numeroFactura: [''],
      proveedorId: [null]
    });

    this.empleadoService.getAll().subscribe({
      next: (data) => (this.empleados = data),
      error: () => this.toastr.error('Error cargando empleados')
    });
  }

  onTipoChange(): void {
    const tipo = this.movimientoForm.get('tipo')?.value;

    if (tipo === 'EGRESO') {
      this.categoriaOptions = ['GASTO_MENOR', 'PAGO_SUELDO', 'ADELANTO', 'PROVEEDOR'];
    } else if (tipo === 'INGRESO') {
      this.categoriaOptions = ['VENTA', 'APORTE', 'OTROS'];
    } else {
      this.categoriaOptions = [];
    }

    this.movimientoForm.patchValue({ categoriaMovimiento: null });
  }

  onCategoriaChange(): void {
    const categoria = this.movimientoForm.get('categoriaMovimiento')?.value;
    // limpiar campos al cambiar tipo
    this.movimientoForm.patchValue({
      descripcion: '',
      empleadoId: null,
      tipoSueldo: null,
      mesCorrespondiente: null,
      numeroFactura: '',
      proveedorId: null
    });
  }

  guardar(): void {
    if (this.movimientoForm.invalid) {
      this.toastr.warning('Completa los campos obligatorios');
      return;
    }

    const movimiento = this.movimientoForm.value;
    const categoria = movimiento.categoriaMovimiento;

    // Seleccionar endpoint dinámicamente
    let endpoint = '';
    switch (categoria) {
      case 'GASTO_MENOR':
        endpoint = 'gasto-menor';
        break;
      case 'PAGO_SUELDO':
      case 'ADELANTO':
        endpoint = 'sueldo';
        movimiento.tipoSueldo = categoria === 'ADELANTO' ? 'ADELANTO' : 'SUELDO_MENSUAL';
        break;
      case 'PROVEEDOR':
        endpoint = 'proveedor';
        break;
      default:
        endpoint = 'generico';
    }

    console.log('📤 Enviando a endpoint:', endpoint, movimiento);

    this.movimientoService.create( movimiento).subscribe({
      next: () => this.toastr.success('✅ Movimiento registrado correctamente'),
      error: (err: { error: { message: any; }; }) => {
        console.error(err);
        this.toastr.error(err.error?.message || 'Error al guardar movimiento');
      }
    });
  }
}
