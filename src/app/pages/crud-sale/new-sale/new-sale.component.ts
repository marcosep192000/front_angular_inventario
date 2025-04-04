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
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
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
    private commonSale: CommonSaleService
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
  newSale() {
    if (this.products.length > 0) {
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

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.saveCommonSale();
        } else {
          this.toastr.warning('La venta no fue completada.');
            this.products = [];
            this.code = '';
        }
      });
    } else {
      this.toastr.warning('No hay articulos seleccionados.');
    }
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

  saveCommonSale() {
    // Validar si el cliente está seleccionado
    if (!this.selectedClient) {
      this.toastr.error('Debe seleccionar un cliente.');
      return;
    }

    // Crear el objeto SaleCommon con los datos actuales de la venta
    const saleCommon: SaleCommon = {
      tipo: 'FACTURA', // O el tipo de venta que corresponda
      client: this.selectedClient.id, // Usamos el ID del cliente seleccionado
      numero: Math.floor(Math.random() * 1000000), // Genera un número de ticket aleatorio (puedes ajustar esto)
      observation: 'Observación de la venta', // Puedes poner un texto de observación
      subTotal: this.getTotalPrice(), // El subtotal es el total de los productos
      total: this.getTotalPrice(), // El total puede ser el mismo en este caso, pero si hay descuentos, ajustes, hazlo aquí
      ticketDetails: this.products.map((product) => ({
        amount: product.quantity,
        price: product.salePrice,
        idProduct: product.id,
        productName: product.name, // Suponiendo que el producto tenga una propiedad 'name'
        barCode: product.barCode, // Suponiendo que el producto tenga un código de barras
        salePrice: product.salePrice,
        marca: String(product.marca), // Suponiendo que el producto tenga una propiedad 'brand'
        iva: product.iva, // El IVA que corresponda
        subTotal: product.salePrice * product.quantity, // El subtotal del producto
      })),
    };

    // Llamar al servicio y pasar el objeto saleCommon
    this.commonSale.saveCommon(saleCommon).subscribe(
      (response) => {
        console.log('Venta guardada con éxito:', response);
        this.toastr.success('Venta guardada con éxito');
        this.products = [];
        this.code = '';
        this.generatePDF(saleCommon); // Vaciar la lista de productos seleccionados
        // Aquí no se necesita cerrar el diálogo de NewSaleComponent porque no usamos MatDialogRef
      },
      (error) => {
        console.error('Error al guardar la venta:', error);
        this.toastr.error('Hubo un error al guardar la venta');
          this.products = [];
          this.code = '';
      }
    );
  }
}
