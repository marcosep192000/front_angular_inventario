import { Component, OnInit, Pipe } from '@angular/core';
import { FormFacturaDatosProveedorComponent } from "./form-factura-datos-proveedor/form-factura-datos-proveedor.component";
import { RegistrarDetalleFacturaProveedorComponent } from "./registrar-detalle-factura-proveedor/registrar-detalle-factura-proveedor.component";
import { SupplierPaymentService } from '../../../services/supplier-payment.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from "../../../shared/spinner/spinner.component";


@Component({
  selector: 'app-registrar-factura-proveedor',
  standalone: true,
  imports: [
    FormFacturaDatosProveedorComponent,
    RegistrarDetalleFacturaProveedorComponent,
    ToastrModule,
    CommonModule,
    SpinnerComponent
],
  templateUrl: './registrar-factura-proveedor.component.html',
  styleUrl: './registrar-factura-proveedor.component.css',
})
export class RegistrarFacturaProveedorComponent implements OnInit {
  constructor(
    private invoiceService: SupplierPaymentService,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {}
  datosHijo1: any = null;
  datosHijo2: any = null;
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
    this.subtotalFactura = this.subtotal();
  }
  validarDatos(datos: any): boolean {
    if (!datos || Object.keys(datos).length === 0) return false; // Verifica si el JSON está vacío

    return Object.values(datos).every(
      (valor) => valor !== null && valor !== '' && valor !== undefined
    );
  }
  crearFactura() {
    if (this.validarDatos(this.datosHijo1Change)) {


     
    
      if (this.datosHijo1 != null && this.datosHijo2.length >= 1) {
        // Verificar si datosHijo1 es una cadena antes de parsear
        const factura =
          typeof this.datosHijo1 === 'string'
            ? JSON.parse(this.datosHijo1)
            : this.datosHijo1;
        // Verificar si datosHijo2 es una cadena antes de parsear
        const productos =
          typeof this.datosHijo2 === 'string'
            ? JSON.parse(this.datosHijo2)
            : this.datosHijo2;
        factura.invoiceDetailsProviders = productos; // Agregar productos a la factura
        console.log('Factura creada:', JSON.stringify(factura, null, 2));
        if (factura.amount > 0 && factura.amount > this.subtotal()) {
          this.subtotalFactura = this.subtotal();
          console.log(this.subtotalFactura + 'SUBTOTAL Factura');
          this.invoiceService.createPaymentSupplier(factura).subscribe((data) => {
            console.log('Factura creada con éxito:', data);
          });
        } else {
          console.error('El monto total de la factura debe ser mayor a');
          this.toast.error(
            'El monto total de la factura debe ser mayor a $' + this.subtotal()
          );
          return; // Salir del método para evitar que se siga creando la factura sin datos válidos.
        }
      }
    }
    this.toast.error("Complete los datos de el Comprovante")
  }

  subtotal(): number {
    return this.datosHijo2.reduce(
      (total: number, datosHijo2: { precioTotal: number }) =>
        total + datosHijo2.precioTotal,
      0
    );
  }
}

