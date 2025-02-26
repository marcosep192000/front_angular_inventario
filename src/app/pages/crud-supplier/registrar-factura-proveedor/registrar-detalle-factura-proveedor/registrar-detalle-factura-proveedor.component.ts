import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { FindSupplierComponent } from '../../find-supplier/find-supplier.component';
import { PaymentTermsComponent } from '../../payment-terms/payment-terms.component';
import { ProductService } from '../../../../services/product.service';
import { SupplierPaymentService } from '../../../../services/supplier-payment.service';
import { ProductItemSale } from '../../../../interfaces/ProductItemSale';
import { FormProductComponent } from '../../../crud-product/form-product/form-product.component';

@Component({
  selector: 'app-registrar-detalle-factura-proveedor',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatSlideToggleModule,
    ToastrModule,
  ],
  templateUrl: './registrar-detalle-factura-proveedor.component.html',
  styleUrl: './registrar-detalle-factura-proveedor.component.css',
})
export class RegistrarDetalleFacturaProveedorComponent {
@Output() productosEmitidos = new EventEmitter<any>();
  products: ProductItemSale[] = [];
  code: string = '';
  product!: ProductItemSale;
  formProduct!: FormGroup;
  formInvoice!: FormGroup;
  showForm?: boolean = false;
  constructor(
    private productService: ProductService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private supplierPamentService: SupplierPaymentService
  ) {}

  forms() {
    this.formProduct = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', Validators.required],
      stock: ['', Validators.required],
      iva: ['', Validators.required],
      saleprice: ['', Validators.required],
      quantity: [5, [Validators.required, Validators.min(1)]],
      totalStock: [{ value: 0 }],
      precioTotal: ['', Validators.required],
    });
    this.formProduct.get('quantity')?.valueChanges.subscribe((quantity) => {
      if (quantity && quantity > 0) {
        const stock = this.formProduct.get('stock')?.value || 0;
        const price = this.formProduct.get('price')?.value || 0;
        const iva = this.formProduct.get('iva')?.value || 0;

        this.formProduct.patchValue({
          totalStock: stock + quantity,
          precioTotal: (quantity * price) * (1 + (iva / 100))
        }, { emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    this.forms();
    this.EnviarProduct();
  }

  onInputChange($event: Event) {
    this.code = ($event.target as HTMLInputElement).value;
    if (this.code) {
      this.productService.search(this.code).subscribe(
        (data) => {
          this.product = data;
          this.loadProduct(this.product);
          this.showForm = true;
        },
        (err) => {
          this.showForm = false;
        }
      );
    } else {
      this.showForm = false;
      this.code = '';
      ($event.target as HTMLInputElement).value = '';
    }
  }
  loadProduct(data: ProductItemSale): void {
    if (data) {
     
   
      this.product = data;
      this.formProduct.patchValue({
        name: data.name,
        description: data.description,
        stock: data.stock,
        iva: data.iva,
        salePrice: data.salePrice,
        price: data.price,
        quantity: data.quantity,
        totalStock: data.totalStock, 
        precioTotal: data.precioTotal,
      });
      this.formProduct.get('name')?.disable();
      this.formProduct.get('description')?.disable();
      this.formProduct.get('stock')?.disable();
      this.formProduct.get('iva')?.disable();
    } else {
      console.warn('Producto no encontrado');
    }
  }
  addListProduct() {
    const productData = {
      ...this.formProduct.getRawValue(),
      barCode: this.code,
    };
    const existingProduct = this.products.find(
      (product) => product.name === productData.name
    );
    if (!this.formProduct.valid) {
      if (existingProduct) {
        this.toastr.info('Ya existe el producto en la lista de productos!');
        this.showForm = false;
      } else if (productData.quantity <= 0 || productData.quantity == null) {
        this.toastr.error('La cantidad de ingreso es menor o igual a 0 (cero)');
      } else {
        const totalPrd = Number(productData.quantity) + Number(productData.stock);
        productData.totalStock = totalPrd;
        this.products.push(productData);
        this.code = '';
        this.formProduct.reset();
        this.toastr.success('Se agregó el producto a la lista');
        this.showForm = false;
        this.EnviarProduct();
      }
    } else {
      this.toastr.error(
        '¡El formulario no es válido! Por favor, verifique que los datos estén correctos.'
      );
    }
  }


  EnviarProduct(): void {
    if (this.sumarlista() > 0) {
      this.productosEmitidos.emit(this.products);
 
    }
    
  }
  sumarlista(): number { 
    const cantProdList = this.products.length;
    console.log(cantProdList);
    return cantProdList; 
  }


  createProduct(event: Event) {
    event.preventDefault();
    const dialogRef = this.dialog.open(FormProductComponent, {
      disableClose: true,
      autoFocus: true,
      hasBackdrop: true,
      closeOnNavigation: false,
      data: { tipo: 'createProduct' },
    });
    dialogRef.afterClosed().subscribe(() => {});
  }

  deleteProduct(barCode: string) {
    const index = this.products.findIndex(
      (product) => product.barCode === barCode
    );
    if (index > -1) {
      this.products.splice(index, 1);
      this.toastr.success('Producto eliminado de la lista.');
    } else {
      this.toastr.error('No se encontró el producto en la lista.');
    }
  }
  cancelarBtn() {
    this.formProduct.reset();
    this.code = '';
    this.showForm = false;
  }
}
