import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastrModule } from 'ngx-toastr'; // Asegúrate de importar correctamente ToastrModule
import { Client } from '../../../interfaces/Client';
import { ProductItemSale } from '../../../interfaces/ProductItemSale';
import { ProductService } from '../../../services/product.service';
import { TotalSaleComponent } from '../total-sale/total-sale.component';
import { SearchClientByDniComponent } from '../../crud-client/search-client-by-dni/search-client-by-dni.component';
import { ToastrService } from 'ngx-toastr';
import { CommonSaleService } from '../../../services/common-sale.service';
import { SaleCommon } from '../../../interfaces/sale-common';
import { jsPDF } from 'jspdf';
import { IconComponent } from "../../../shared/dasboard/icon/icon.component";
import { Console } from 'console';
import { ClientService } from '../../../services/client.service';
import { CtaCteService } from '../../../services/cta-cte.service';
import { registrarDeudaCtaCteCliente } from '../../../interfaces/registrarDeudaCtaCteCliente';
@Component({
  selector: 'app-new-sale',
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
    MatPaginatorModule,
    MatTableModule,
    MatTooltipModule,
    ToastrModule,
    IconComponent
],
  templateUrl: './new-sale.component.html',
  styleUrls: ['./new-sale.component.css'],
})
export class NewSaleComponent implements OnInit {
  clients = new Array<Client>();
  buscarClienteIdCuentaCorriente:any;
  products = new Array<ProductItemSale>();
  code: string = '';
  product?: ProductItemSale;
  errorMessage?: string;
  selectedClient: any;
  saleCommon?: SaleCommon;
  constructor(
    fb: FormBuilder,
    private productService: ProductService,
    private toastr: ToastrService,
    public dialog: MatDialog,
    private commonSale: CommonSaleService,
    private ctaCteService: CtaCteService, 
    private clienteService: ClientService
  ) {}
  ngOnInit(): void {}
  onSubmit() {
    this.productService.search(this.code).subscribe(
      (data) => {
        const existingProduct = this.products.find(
          (product) => product.id === data.id
        );

        if (existingProduct) {
          // Si el producto ya está en la lista, aumentar la cantidad
          if (existingProduct.stock > existingProduct.quantity) {
            existingProduct.quantity += 1;
          } else {
           this.toastr.error('Excede al stock deseado.');
            
          }
        } else {
          // Si no, agregar el producto a la lista con cantidad inicial 1
          data.quantity = 1; // Inicializa la cantidad en 1
          this.products.push(data);
        }
        this.errorMessage = undefined; // Limpiar mensaje de error si se encontró el producto
      },
      (error) => {
        this.toastr.error('No se encontró el producto');
      }
    );
    this.getTotalQuantity();
  }
  deleteProduct(id: number) {
    this.products = this.products.filter((product) => product.id !== id);
  }
  // Cuenta la cantidad de productos en la lista
  getTotalQuantity(): number {
    return this.products.reduce(
      (total, product) => total + product.quantity,
      0
    );
  }
  getTotalPrice(): number {
    return this.products.reduce(
      (total, product) => total + product.salePrice * product.quantity,
      0
    );
  }
  getClient() {//lama al componente para buscar un cliente y luego mostrarlo 
    const dialogRef = this.dialog.open(SearchClientByDniComponent, {
      disableClose: true,
      autoFocus: true,
      hasBackdrop: true,
      closeOnNavigation: false,
      data: {
        tipo: 'createProduct',
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
       // console.log('Cliente seleccionado:', result);
        this.selectedClient = result; // Almacena el cliente seleccionado
      }
    });
  }

  
  // Se llama al formulario de venta y crea el ticket para la nueva venta
  async newSale() {
    if (this.products.length === 0) {
      this.toastr.warning('No hay artículos seleccionados.');
      return;
    }
  
    const dialogRef = this.dialog.open(TotalSaleComponent, {
      disableClose: true,
      autoFocus: true,
      hasBackdrop: true,
      closeOnNavigation: false,
      data: {
        tipo: '',
        client: this.selectedClient.id,
        totalPrice: this.getTotalPrice(),
      },
    });
  
    dialogRef.afterClosed().subscribe(async (result) => {
      if (!result || !result.tipoCuenta) {
        this.toastr.warning('La venta no fue completada.');
        this.products = [];
        this.code = '';
        return;
      }
    
      const tipoCuenta = result.tipoCuenta;
      const total = result.totalPrice;
      const idClient = result.idCliente;
    
      try {
        if (tipoCuenta === 'CONTADO') {
          const sale = this.buildSaleCommon(tipoCuenta, null); // null porque no hay cta cte
          this.saveCommonSale(sale);
        } else if (tipoCuenta === 'CTA_CTE') {
          const idCtaCte = await this.buscarCuentaIdCorrienteCliente(idClient);
          const sale = this.buildSaleCommon(tipoCuenta, idCtaCte);
          this.saveCtaCteSale(idClient, total);
          this.saveCommonSale(sale);
        }
      } catch (error) {
        this.toastr.error('Error al procesar la venta.');
      }
    });
  }
  
  buscarCuentaIdCorrienteCliente(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.clienteService.getClientById(id).subscribe({
        next: (data) => {
          const idCuenta = data.cuentaCorriente?.id;
          console.log("✅ ID cuenta corriente:", idCuenta);
          resolve(idCuenta);
        },
        error: (err) => {
          reject(err);
        }
      });
    });
  }
  

  saveCtaCteSale(tipoDeCuenta: any, precioTotal: number) {
    const payload: registrarDeudaCtaCteCliente = {
      registrarDeudaCtaCte: precioTotal,
      ticketIds: []
    };
  
    this.ctaCteService.updateCtaCte(tipoDeCuenta, payload).subscribe(
      response => {
        console.log('Actualización exitosa', response);
      },
      error => {
        console.error('Error al actualizar:', error);
      }
    );
  }


  generatePDF(saleCommon: SaleCommon) {

    const doc = new jsPDF();

    // Título de la factura
    doc.setFontSize(18);
    doc.text('Factura de Venta', 14, 20);

    // Información del cliente
    doc.setFontSize(12);
    doc.text(`Cliente: ${this.selectedClient.name}`, 14, 30);
    doc.text(`Dirección: ${this.selectedClient.address}`, 14, 40);
    doc.text(`Número de ticket: ${saleCommon.numero}`, 14, 50);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 60);

    // Detalles de los productos
    let yPosition = 70;
    doc.setFontSize(10);
    doc.text('Descripción', 14, yPosition);
    doc.text('Cantidad', 100, yPosition);
    doc.text('Precio', 140, yPosition);
    doc.text('Total', 180, yPosition);

    yPosition += 10;

    saleCommon.ticketDetails.forEach((item) => {
      doc.text(item.productName, 14, yPosition);
      doc.text(item.amount.toString(), 100, yPosition);
      doc.text(item.salePrice.toFixed(2), 140, yPosition);
      doc.text((item.salePrice * item.amount).toFixed(2), 180, yPosition);
      yPosition += 10;
    });

    // Totales
    yPosition += 10;
    doc.text(`Subtotal: $${saleCommon.subTotal.toFixed(2)}`, 14, yPosition);
    yPosition += 10;
    doc.text(`Total: $${saleCommon.subTotal.toFixed(2)}`, 14, yPosition);

    // Guardar el PDF
    doc.save(`Factura_${saleCommon.numero}.pdf`);
  }
  
  buildSaleCommon(tipo: string,ctaCte : any): SaleCommon {
    const sale: SaleCommon = {
      tipo: 'FACTURA',
      stateTicket: tipo == 'CTA_CTE' ? false : true,
      ctaCte:ctaCte,
      saleCondition: tipo,
      client: this.selectedClient.id,
      numero: Math.floor(Math.random() * 1000000),
      observation: 'Observación de la venta',
      subTotal: this.getTotalPrice(),
      total: this.getTotalPrice(),
      ticketDetails: this.products.map((product) => ({
        amount: product.quantity,
        price: product.salePrice,
        idProduct: product.id,
        productName: product.name,
        barCode: product.barCode,
        salePrice: product.salePrice,
        marca: String(product.marca),
        iva: product.iva,
        subTotal: product.salePrice * product.quantity,
      }))
    };
  
    console.log('➡️ Objeto saleCommon generado:', sale); // ✅ log correcto
  
    return sale;
  }
  

 saveCommonSale(saleCommon: SaleCommon) {
  if (!this.selectedClient) {
    this.toastr.error('Debe seleccionar un cliente.');
    return;
  }

  this.commonSale.saveCommon(saleCommon).subscribe(
    () => {
      this.toastr.success('Venta guardada con éxito');

      // Mostrar confirmación con opción de imprimir
      const confirmPrint = window.confirm('¿Desea imprimir el ticket?');
      if (confirmPrint) {
        this.printTicket(saleCommon);
      } else {
        this.generatePDF(saleCommon); // PDF si no imprime
      }

      this.products = [];
      this.code = '';
    },
    (error) => {
      this.toastr.error('Hubo un error al guardar la venta');
      this.products = [];
      this.code = '';
    }
  );
}

printTicket(saleCommon: SaleCommon) {
  let ipcRenderer: any = null;
  try {
    if ((window as any)?.require) {
      ipcRenderer = (window as any).require('electron')?.ipcRenderer ?? null;
    }
  } catch (error) {
    console.warn('No se pudo cargar ipcRenderer:', error);
  }

  const styles = `...`; // Igual al que ya tienes
  const itemsHTML = `...`; // igual

  const content = `
    <html>
      <head>${styles}</head>
      <body>
        <h2 style="text-align: center;">BON-BINI</h2>
        <p style="text-align: center;">CUIT 27-29625726-0</p>
        <p style="text-align: center;">COMPROBANTE NO VALIDO COMO FACTURA X</p>
        <hr>
        <p>Ticket N°: ${saleCommon.numero}</p>
        <p>Cliente: ${this.selectedClient?.name}</p>
        <p>Fecha: ${new Date().toLocaleString()}</p>
        <hr>
        ${itemsHTML}
        <hr>
        <div class="row"><strong>Total:</strong> <strong>$${saleCommon.total?.toFixed(2)}</strong></div>
        <hr>
        <p style="text-align: center;">¡Gracias por su compra!</p>
      </body>
    </html>
  `;

  if (ipcRenderer) {
    ipcRenderer.send('print-sale-ticket', content);
  } else {
    // Fallback para versión web
    const popupWin = window.open('', '_blank', 'width=250,height=600');
    if (popupWin) {
      popupWin.document.open();
      popupWin.document.write(content);
      popupWin.document.close();
    }
  }
}

}
