import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, Pipe, ViewChild } from '@angular/core';
import { FormFacturaDatosProveedorComponent } from './form-factura-datos-proveedor/form-factura-datos-proveedor.component';
import { RegistrarDetalleFacturaProveedorComponent } from './registrar-detalle-factura-proveedor/registrar-detalle-factura-proveedor.component';
import { SupplierPaymentService } from '../../../services/supplier-payment.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';
import { Product } from '../../../interfaces/Product';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DialogRef } from '@angular/cdk/dialog';
import { DialogGenericComponent } from '../../../shared/genericsComponents/dialog-generic/dialog-generic.component';
import { subscribe } from 'node:diagnostics_channel';

@Component({
  selector: 'app-registrar-factura-proveedor',
  standalone: true,
  imports: [
    FormFacturaDatosProveedorComponent,
    RegistrarDetalleFacturaProveedorComponent,
    ToastrModule,
    CommonModule,
    SpinnerComponent,
    MatDialogModule,
  ],
  templateUrl: './registrar-factura-proveedor.component.html',
  styleUrl: './registrar-factura-proveedor.component.css',
})
export class RegistrarFacturaProveedorComponent implements OnInit {
  @Output() facturaDatosChange = new EventEmitter(); // even
  @ViewChild('childRef')
  datosProveedorComponent!: FormFacturaDatosProveedorComponent;
  showForm: boolean = true;
  showFormSuBtotal: boolean = true;
  @ViewChild('childRefDetalle')
  datosDetallesProveedorComponent!: RegistrarDetalleFacturaProveedorComponent;
  constructor(
    private dialog: MatDialog,
    private cdRef: ChangeDetectorRef,
    private invoiceService: SupplierPaymentService,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    this.crearFactura();
  }
  datosHijo1: any = null;
  datosHijo2: any = [];
  subtotalFactura: any = null;

  datosHijo1Change(datos: any) {
    this.datosHijo1 = datos;
    console.log(
      'Datos recibidos del Hijo 1:',
      JSON.stringify(this.datosHijo1, null, 2)
    );
  }
  datosHijo2Change(datos: any) {
    this.datosHijo2 = datos;
    console.log(
      'Datos recibidos del Hijo 2:',
      JSON.stringify(this.datosHijo2, null, 2)
    );

    if (this.datosHijo2.length === 0) {
      this.subtotalFactura = 0; // Si la lista está vacía, establecer subtotal en 0
    } else {
      this.subtotalFactura = this.subtotal();
    }

    this.cdRef.detectChanges(); // Forzar actualización de la vista
  }

  validarDatos(datos: any): boolean {
    // Verifica si el objeto está vacío
    if (!datos || Object.keys(datos).length === 0) return false;
    // Verifica si los valores de cada propiedad son válidos
    return Object.keys(datos).every((key) => {
      const value = datos[key];
      // Verifica si el valor es nulo, vacío o indefinido
      if (value === null || value === undefined || value === '') {
        return false;
      }
      // Agregar validación específica para campos como 'amount', 'invoiceNumber', etc.
      if (key === 'amount' && typeof value !== 'number') {
        return false;
      }

      return true;
    });
  }

  crearFactura() {
    if (this.validarDatos(this.datosHijo1)) {
      if (this.datosHijo1 != null && this.datosHijo2.length >= 1) {
        const factura =
          typeof this.datosHijo1 === 'string'
            ? JSON.parse(this.datosHijo1)
            : this.datosHijo1;
        const productos =
          typeof this.datosHijo2 === 'string'
            ? JSON.parse(this.datosHijo2)
            : this.datosHijo2;
        factura.invoiceDetailsProviders = productos;

        console.log('Enviando factura:', JSON.stringify(factura, null, 2));

        if (factura.amount > 0 && factura.amount >= this.subtotal()) {
          this.subtotalFactura = this.subtotal();
          console.log(this.subtotalFactura + ' SUBTOTAL Factura');

          this.invoiceService.createPaymentSupplier(factura).subscribe({
            next: (data) => {
              console.log('Factura creada con éxito:', data);
              console.log('esta es la factura:' + data);
              this.toast.success('Factura creada con éxito!');
              this.datosProveedorComponent.resetDatosProveedor();
              this.datosDetallesProveedorComponent.resetForm();
              this.datosDetallesProveedorComponent.resetListaProductos();
              this.subtotalFactura = 0;
              this.showForm = false;
            },
            error: (err) => {
              console.error('Error al crear factura:', err);
              this.toast.error(err.error?.message || 'Factura ya registrada');
            },
          });
        } else {
          console.error(
            'El monto total de la factura debe ser mayor a',
            (this.subtotalFactura = this.subtotal())
          );
          this.toast.error(
            'El monto total de la factura debe ser mayor a $' + this.subtotal()
          );
          return;
        }
      }
    } else {
      console.error('Datos de la factura inválidos');
    }
  }

  subtotal(): number {
    // Verificar si datosHijo2 tiene elementos
    if (this.datosHijo2 && this.datosHijo2.length > 0) {
      return this.datosHijo2.reduce(
        (total: number, item: { precioTotal: number }) =>
          total + item.precioTotal,
        0
      );
    } else {
      // Si no hay datos en datosHijo2, retorna 0 o alguna lógica que prefieras
      return 0;
    }
  }

  crearFacturaDialog() {
    const dialogRef = this.dialog.open(DialogGenericComponent, {
      disableClose: true,
      autoFocus: true,
      hasBackdrop: true,
      closeOnNavigation: false,
      data: {
        component: '', // O cualquier otro componente relevante
        data: `Crear Factura`, // Aquí pasas el mensaje
        state: 'crear',
        icon: '', // Ícono que quieres mostrar
        message: `Vas a crear la factura para este proveedor Continuar? `,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        try {
          this.crearFactura();

        } catch (error) {
          console.error('Error al crear la factura:', error);
          this.toast.error('Error al crear la factura');
        }
      } else {
        this.toast.error('Factura CANCELADA');
        console.log('Cancelado');
      }
    });
  }
}
