import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
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
import { ProductService } from '../../../../services/product.service';
import { SupplierPaymentService } from '../../../../services/supplier-payment.service';
import { ProductItemBuy } from '../../../../interfaces/productItemBuy';
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
  @Output() productosEmitidos = new EventEmitter<ProductItemBuy[]>();
  products: ProductItemBuy[] = [];
  code: string = '';
  product!: ProductItemBuy;
  formProduct!: FormGroup;
  showForm?: boolean = false;

  constructor(
    private productService: ProductService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private supplierPamentService: SupplierPaymentService
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.EnviarProduct();
  }

  initForms() {
    this.formProduct = this.fb.group({
      name: ['', ],
      description: ['',],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      iva: [0, [Validators.required, Validators.min(0)]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      totalStock: [{ value: 0, disabled: true }],
      precioTotal: [{ value: 0, disabled: true }],
    });

    this.formProduct.get('quantity')?.valueChanges.subscribe((quantity) => {
      const stock = Number(this.formProduct.get('stock')?.value) || 0;
      const price = Number(this.formProduct.get('price')?.value) || 0;
      const iva = Number(this.formProduct.get('iva')?.value) || 0;
      quantity = Number(quantity) || 0;

      this.formProduct.patchValue(
        {
          totalStock: stock + quantity,
          precioTotal: quantity * price * (1 + iva / 100),
        },
        { emitEvent: false }
      );
    });
  }

  onInputChange(event: Event) {
    this.code = (event.target as HTMLInputElement).value;
    if (this.code) {
      this.productService.search(this.code).subscribe(
        (data) => {
          this.product = data;
          this.loadProduct(this.product);
          this.showForm = true;
        },
        () => {
          this.showForm = false;
        }
      );
    } else {
      this.resetForm();
    }
  }

  loadProduct(data: ProductItemBuy): void {
    if (data) {
      this.product = data;
      this.formProduct.patchValue({
        name: data.name,
        description: data.description,
        stock: data.stock,
        iva: data.iva,
        price: data.price,
        quantity: data.quantity ?? 1,
        totalStock: Number(data.stock) + Number(data.quantity ?? 1),
        precioTotal:Number(data.quantity ?? 1) * data.price * (1 + data.iva / 100),
      });

      ['name', 'description', 'stock', 'iva'].forEach((field) => {
        this.formProduct.get(field)?.disable();
      });
    } else {
      console.warn('Producto no encontrado');
    }
  }

  addListProduct() {
   

    const productData: ProductItemBuy = {
      ...this.formProduct.getRawValue(),
      barCode: this.code,
      price: Number(this.formProduct.get('price')?.value),
      quantity: Number(this.formProduct.get('quantity')?.value),
      iva: Number(this.formProduct.get('iva')?.value),
      totalStock: Number(this.formProduct.get('totalStock')?.value),
      precioTotal: Number(this.formProduct.get('precioTotal')?.value),
    };

    if (productData.quantity <= 0) {
      this.toastr.error(
        'La cantidad de ingreso no puede ser menor o igual a 0.'
      );
      return;
    }

    const existingProduct = this.products.find(
      (product) => product.name === productData.name
    );

    if (existingProduct) {
      this.toastr.info('Ya existe el producto en la lista.');
      this.showForm = false;
      return;
    }

    this.products.push(productData);
    this.toastr.success('Producto agregado a la lista.');
    this.resetForm();
    this.EnviarProduct();
  }

  EnviarProduct(): void {
    if (this.products.length > 0) {
      this.productosEmitidos.emit(this.products);
    }
  }

  createProduct(event: Event) {
    event.preventDefault();
    this.dialog.open(FormProductComponent, {
      disableClose: true,
      autoFocus: true,
      hasBackdrop: true,
      closeOnNavigation: false,
      data: { tipo: 'createProduct' },
    });
  }

  deleteProduct(barCode: string) {
    this.products = this.products.filter(
      (product) => product.barCode !== barCode
    );
    this.toastr.success('Producto eliminado de la lista.');
  }

  resetForm() {
    this.formProduct.reset();
    this.code = '';
    this.showForm = false;
  }
  cancelarBtn() { }
}
