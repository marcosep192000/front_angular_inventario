import { Component, Inject } from '@angular/core';
import { SupplierPaymentService } from '../../../../../services/supplier-payment.service';
import { ProductItemBuy } from '../../../../../interfaces/ProductItemBuy';
import { TablaGenericComponent } from "../../../../../shared/genericsComponents/tabla-generic/tabla-generic/tabla-generic.component";
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
  selector: 'app-ver-detalle-factura',
  standalone: true,
  imports: [TablaGenericComponent],
  templateUrl: './ver-detalle-factura.component.html',
  styleUrl: './ver-detalle-factura.component.css',
})
export class VerDetalleFacturaComponent {
  VerDetalleFacturaComponent!: VerDetalleFacturaComponent;
  constructor(private supplierPaymentService: SupplierPaymentService,@Inject(MAT_DIALOG_DATA) public data1:any) {}
  btnCerrar = true;
  data: ProductItemBuy[] = [];
  verDetalle!: VerDetalleFacturaComponent;
  columns: string[] = [
    'barCode', 
    'name',
    'price',
    'iva',
    'quantity',
    'precioTotal',
    
  ];
  columnNames: { [key: string]: string } = {
    barCode: 'codigo de barras',
    name: 'nombre',
    price: 'precio',
    iva: 'Iva',
    quantity: 'Cantidad',
    precioTotal: 'Precio Total',
  };
  columnConfig = {
    amount: { type: 'currency' },
    saldoPendiente: { type: 'currency' },
    precioTotal: { type: 'currency' },
  };

  getFacturaDetalle(id:number) {
    return this.supplierPaymentService
      .getFacturaDetalle(id)
      .subscribe((detalle) => {
        console.log(detalle);
        console.log(this.data);
        this.data = detalle;
      });
  }

  ngOnInit(): void {
    this.getFacturaDetalle(this.data1.updateSupplier); // Aqui deberia recibir el id de la factura que se quiere mostrar
  }
  
}
