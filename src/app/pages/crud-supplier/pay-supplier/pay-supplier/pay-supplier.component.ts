import { Component, numberAttribute, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TablaGenericComponent } from '../../../../shared/genericsComponents/tabla-generic/tabla-generic/tabla-generic.component';

import { SupplierService } from '../../../../services/supplier.service';
import { FormSupplierComponent } from '../../form-supplier/form-supplier.component';
import { SupplierPaymentService } from '../../../../services/supplier-payment.service';
import { facturasProveedor } from '../../../../interfaces/facturasProveedor';
import { VerDetalleFacturaComponent } from './ver-detalle-factura/ver-detalle-factura.component';
import { FindSupplierComponent } from "../../find-supplier/find-supplier.component";
@Component({
  selector: 'app-pay-supplier',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    FormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    MatTooltipModule,
    TablaGenericComponent,
    FindSupplierComponent
],
  templateUrl: './pay-supplier.component.html',
  styleUrl: './pay-supplier.component.css',
})
export class PaySupplierComponent implements OnInit {
mensajeRecibido: number = 0; 
resivirMensaje(mensaje : number) {
  this.mensajeRecibido = mensaje; 
  this.getSupplier(this.mensajeRecibido);
}
  idProveedor: any = null;
  columns: string[] = [
    'idInvoice',
    'dueDate',
    'payDay',
    'providerName',
    'amount',
    'saldoPendiente',
    'tipoDeCuentaEnum',
    'montoTotal',
    'dateOfEntry',
  ];
  columnNames: { [key: string]: string } = {
    idInvoice: 'Factura',
    dueDate: 'Fecha de Vto.',
    payDay: 'Fecha de Pago',
    providerName: 'Proveedor',
    amount: 'subtotal',
    saldoPendiente: 'Saldo Pendiente',
    tipoDeCuentaEnum: 'Forma de pago',
    montoTotal: 'Monto Total',
    dateOfEntry: 'Ingreso',
  };
  columnConfig = {
    amount: { type: 'currency' },
    saldoPendiente: { type: 'currency' },
    montoTotal:{type: 'currency'}
  };
  data: facturasProveedor[] = [];

  editComponent = FormSupplierComponent;

  verDetalle = VerDetalleFacturaComponent;
  constructor(
    public supplierService: SupplierService,
    public pagoAProveedoresService: SupplierPaymentService
  ) { }
  
  ngOnInit(): void {

    this.getSupplier(this.mensajeRecibido);
  }
  getSupplier(id : number) {
    this.pagoAProveedoresService.getAllFacturasProveedor(id).subscribe(
      (suppliers) => {
        console.log('Proveedores recibidos:', suppliers);

        // Verifica si `suppliers` es un array
        if (Array.isArray(suppliers)) {
          // Itera sobre cada proveedor y asigna "pendiente" si payDay está vacío
          this.data = suppliers.map((supplier) => ({
            ...supplier,
            payDay: supplier.payDay === null ? 'pendiente' : supplier.payDay,
          }));
        } else {
          console.warn(
            'La respuesta no es un array, se asignará un array vacío.'
          );
          this.data = [];
        }
      },
      (error) => console.error('Error al obtener proveedores:', error)
    );
  }

  editItem(item: any) {
    console.log('Editar:', item);
    alert(`Editar: ${item.name}`);
  }

  deleteItem(item: any) {
    console.log('Eliminar:', item);
    alert(`Eliminar: ${item.name}`);
    this.data = this.data.filter((d) => d.id !== item.id); // Simula la eliminación
  }

  recibirIdProveedor($event: number) {
    this.idProveedor = this.idProveedor;
  }
  formGroup: any;
}
