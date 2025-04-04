import { Component, Inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { ProductService } from '../../../services/product.service';
import { Category } from '../../../interfaces/Category';
import { CategoryService } from '../../../services/category.service';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { error } from 'console';
import { Marca } from '../../../interfaces/marca';
import { MarcaService } from '../../../services/marca.service';
import { FormMarcaComponent } from '../../crud-marca/form-marca/form-marca.component';
import { FormSupplierComponent } from '../../crud-supplier/form-supplier/form-supplier.component';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { SupplierService } from '../../../services/supplier.service';
import { Supplier } from '../../../interfaces/supplier';
 


@Component({
  selector: 'app-form-product',
  standalone: true,
  imports: [
    ToastrModule,
    MatInputModule,
    CommonModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    FormsModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
  ],
  templateUrl: './form-product.component.html',
  styleUrl: './form-product.component.css',
})
export class FormProductComponent implements OnInit {
  protected readonly value = signal('');
  calculatedSalePrice: number = 0;

  protected onInput(event: Event) {
    this.value.set((event.target as HTMLInputElement).value);
  }

  formGroup!: FormGroup;
  dataCategories: Category[] = [];
  dataMarca: Marca[] = [];
  dataSuplier: Supplier[] = [];
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<FormProductComponent>,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private productService: ProductService,
    private toastr: ToastrService,
    private marcaService: MarcaService,
    private supplierService: SupplierService
  ) {
    this.formGroup = this.fb.group({
      category: [1],
      marca: [1],
      provider: [1],
      barCode: ['', Validators.required],
      name: ['', Validators.required],
      price: [
        '',
        [
          Validators.required,
          Validators.pattern('^\\d*\\.?\\d*$'), // Acepta números decimales
        ],
      ],
      stock: ['', Validators.required],
      stockMin: ['', Validators.required],
      stateIva: [false, Validators.required],
      unitOfMeasure: [''],
      status: [true],
      iva: [''],
      salePrice: [null, Validators.required],
      productUsefulness: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadMarcas();
    this.loadSuplier();

    if (this.data.updateProduct != null) {
      this.productService
        .findById(this.data.updateProduct)
        .subscribe((datos) => {
          console.log(datos);
          this.formGroup.patchValue({
            category: datos.category.id,
            marca: datos.marca.id,
            provider: datos.provider.id,
            barCode: datos.barCode,
            name: datos.name,
            price: datos.price,
            stateIva: datos.stateIva,
            iva: datos.stateIva ? 0:21,
            stock: datos.stock,
            stockMin: datos.stockMin,
            unitOfMeasure: 32,
            salePrice: datos.salePrice,
            productUsefulness: datos.productUsefulness,
          });
        });
    }

    this.formGroup.valueChanges.subscribe((values) => {
      this.calculateSalePrice(
        values.price,
        values.productUsefulness,
        values.stateIva
      );
    });
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe((categories) => {
      this.dataCategories = categories;
    });
  }
  loadMarcas() {
    this.marcaService.allMarca().subscribe((marcas) => {
      this.dataMarca = marcas;
      console.log(this.dataMarca);
    });
  }

  loadSuplier() {
    this.supplierService.getAllSuppliers().subscribe((supplierInfo) => {
      this.dataSuplier = supplierInfo;
      console.log(this.dataSuplier);
    });
  }

  cancel() {
    this.dialogRef.close();
  }

  save(): void {
    console.log(this.formGroup.value);
    if (this.formGroup.valid) {
      this.productService.save(this.formGroup.value).subscribe((data) => {
        this.dialogRef.close(data);
        this.showSuccess();
        console.log(this.formGroup.value);
      });
    } else {
      console.log(this.formGroup.errors);
      console.log(this.data);
      this.toastr.error(
        'Por favor, complete todos los campos requeridos!',
        '',
        {
          timeOut: 5000,
          positionClass: 'toast-bottom-right',
        }
      );
    }
  }

  showSuccess() {
    this.toastr.success('Producto guardado con Exito!', '', {
      timeOut: 10000,
      positionClass: 'toast-bottom-right',
    });
  }

  update(): void {
    this.productService
      .update(this.data.updateProduct, this.formGroup.value)
      .subscribe((data) => {
        console.log(this.formGroup.value);
        this.dialogRef.close(data);
      });
  }

  /* nueva marca */
  createMarca() {
    const dialogRef = this.dialog.open(FormMarcaComponent, {
      disableClose: true,
      autoFocus: true,
      hasBackdrop: true,
      closeOnNavigation: false,
      data: {
        tipo: 'createMarca',
      },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.loadMarcas();
    });
  }
  /* nuevo proveedor */
  createSupplier() {
    const dialogRef = this.dialog.open(FormSupplierComponent, {
      disableClose: true,
      autoFocus: true,
      hasBackdrop: true,
      closeOnNavigation: false,
      data: {
        tipo: 'createSupplier',
      },
    });
    dialogRef.afterClosed().subscribe(() => {
      this.loadSuplier();
      console.log(dialogRef);
    });
  }

  calculateSalePrice(
    price: number,
    productUsefulness: number,
    stateIva: boolean
  ): void {
    let finalPrice: number;
    // Asegúrate de que `price` y `productUsefulness` sean números
    const priceValue = Number(price);
    const usefulnessValue = Number(productUsefulness);

    if (isNaN(priceValue) || isNaN(usefulnessValue)) {
      console.error('Invalid input for price or product usefulness');
      return;
    }

    if (stateIva === false) {
      finalPrice = (priceValue * usefulnessValue) / 100 + priceValue;
    } else {
      // Con IVA 
      const priceWithIva = priceValue * 1.21;
      finalPrice = priceWithIva +  (priceWithIva   * usefulnessValue) / 100;
    }

    this.calculatedSalePrice = finalPrice;
    this.formGroup.patchValue({ salePrice: finalPrice }, { emitEvent: false});
  }

  onInputChange(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
    // Filtra todos los caracteres no numéricos, excepto el punto decimal
    const filteredValue = input.value.replace(/[^0-9.]/g, '');
    // Limita la longitud a 12 caracteres
    const finalValue = filteredValue.slice(0, 10);
    const control = this.formGroup.get(controlName);
    if (control) {
      control.setValue(finalValue, { emitEvent: false });
    }
  }

  get formattedSalePrice(): string {
    return this.calculatedSalePrice.toFixed(2); // Formatea a dos decimales
  }
}