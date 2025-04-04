import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Pipe,
  ViewChild,
} from '@angular/core';
import { FormFacturaDatosProveedorComponent } from './form-factura-datos-proveedor/form-factura-datos-proveedor.component';
import { RegistrarDetalleFacturaProveedorComponent } from './registrar-detalle-factura-proveedor/registrar-detalle-factura-proveedor.component';
import { SupplierPaymentService } from '../../../services/supplier-payment.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';
import { Product } from '../../../interfaces/Product';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { DialogRef } from '@angular/cdk/dialog';
import { DialogGenericComponent } from '../../../shared/genericsComponents/dialog-generic/dialog-generic.component';
import { subscribe } from 'node:diagnostics_channel';
import { Router } from '@angular/router';

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
  showFormSuBtotal: boolean = false;
  @ViewChild('childRefDetalle')
  datosDetallesProveedorComponent!: RegistrarDetalleFacturaProveedorComponent;
  constructor(
    private router: Router,
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

  totalFacturaSinIva: any = null;
  totalIva : any = null;
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

    if (this.datosHijo2.length == 0) {
      this.subtotalFactura = 0; 
      this.showFormSuBtotal = false;
      // Si la lista está vacía, establecer subtotal en 0
    } else {
      this.showFormSuBtotal = true ;
      this.subtotalFactura = this.subtotal();
    this.totalFacturaSinIva =this.totaleslFacturaSinIva(); 
    this.totalIva= this.calcularTotalIva();
    
    




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
    if (!this.validarDatos(this.datosHijo1) || !Array.isArray(this.datosHijo2) || this.datosHijo2.length < 1) {
        console.error('Datos de la factura inválidos o lista de productos vacía');
       
        return;
    }
    if (!this.validarDatos(this.datosHijo1) == null ) {
      console.error('Cargar Datos de proveedor');
     this.toast.info('Cargar Datos de proveedor');
      return;
  }
    let factura, productos;
    try {
        factura = typeof this.datosHijo1 === 'string' ? JSON.parse(this.datosHijo1) : this.datosHijo1;
        productos = typeof this.datosHijo2 === 'string' ? JSON.parse(this.datosHijo2) : this.datosHijo2;
    } catch (error) {
        console.error('Error al parsear los datos:', error);
        this.toast.error('Error en los datos de la factura');
        return;
    }

    factura.invoiceDetailsProviders = productos;
    const subtotalActual = this.totaleslFacturaSinIva();
    factura.ivaTotal = this.calcularTotalIva(); 
    factura.montoTotal = this.subtotal();


   
    if (isNaN(factura.amount) || factura.amount <= 0 || factura.amount < subtotalActual) {
        console.error('El monto total de la factura debe ser mayor o igual al subtotal:', subtotalActual);
        this.toast.error('El monto total de la factura debe ser mayor o igual a $' + subtotalActual);
        return;
    }

    console.log('Enviando factura:', JSON.stringify(factura, null, 2));
    this.subtotalFactura = subtotalActual;
    
     console.log(factura); 

    this.invoiceService.createPaymentSupplier(factura).subscribe({
        next: (data) => {
            console.log('Factura creada con éxito:', data);
            this.toast.success('Factura creada con éxito!');
            this.datosProveedorComponent.resetDatosProveedor();
            this.datosDetallesProveedorComponent.resetForm();
            this.datosDetallesProveedorComponent.resetListaProductos();
            this.reloadComponent();  this.resetComponent();
            this.subtotalFactura = 0;
            this.totalIva = 0 ; 
            this.totalFacturaSinIva = 0;
            this.showForm = false;
        },
        error: (err) => {
            const mensajeError = err.error?.message || 'Factura Ya Registrada en Sistema!';
            console.error('Factura ya Registrada!', mensajeError);
            this.toast.error(mensajeError);
        },
    });
}

  subtotal(): number {
    // Verificar si datosHijo2 tiene elementos
    if (this.datosHijo2.length > 0) {
      return this.datosHijo2.reduce(
        (total: number, item: { precioTotal: number }) =>
          total + item.precioTotal,
        0, 
      );
    } else {
      // Si no hay datos en datosHijo2, retorna 0 o alguna lógica que prefieras
      return 0;
    }
  }
  //TOTAL IVA ----------------------------------------------------------------
  calcularTotalIva(){
      // Verificar si datosHijo2 tiene elementos
      if (this.datosHijo2.length > 0) {
        return this.datosHijo2.reduce(
          (total: number, item: { iva: number ,price: number }) =>
            total + (item.price * item.iva)/100,
          0, 
        );
      } else {
        // Si no hay datos en datosHijo2, retorna 0 o alguna lógica que prefieras
        return 0;
      }
  }

// TOTAL FACTURA ----------------------------------------------------------------
totaleslFacturaSinIva(): number {
  // Verificar si datosHijo2 tiene elementos
  if (this.datosHijo2.length > 0) {
    return this.datosHijo2.reduce(
      (total: number, item: { price: number, quantity : number }) =>
        total + item.price * item.quantity,
      0, 
    );
  } else {
    // Si no hay datos en datosHijo2, retorna 0 o alguna lógica que prefieras
    return 0;
  }
}






  reloadComponent() {
    this.router
      .navigateByUrl('/dashboard/supplier-list', { skipLocationChange: true })
      .then(() => {
        this.router.navigate([this.router.url]);
      });
  }
  resetComponent() {
    this.datosProveedorComponent.resetDatosProveedor();
    this.datosDetallesProveedorComponent.resetForm();
    this.datosDetallesProveedorComponent.resetListaProductos();
    this.subtotalFactura = 0;
    this.showForm = false;
    this.subtotalFactura = 0;
    this.totalIva = 0 ; 
    this.totalFacturaSinIva = 0;
    this.showForm = false;

    // Forzar la actualización del componente
    this.cdRef.detectChanges();
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

          if (this.validarDatos(this.datosHijo1) && this.datosHijo2Change.length > 0)  // Validar que los datos del proveedor y la lista de productos no estén vacíos
            {

              this.crearFactura();

            } else {
              this.toast.error('Debes completar los datos del proveedor y la lista de productos');
            }
        } catch (error) {
          console.error('Error al parsear los datos:', error);
          }
        } 
      else {
        this.toast.error('Factura CANCELADA');
        console.log('Cancelado');
        
      }
    });
  }
}
