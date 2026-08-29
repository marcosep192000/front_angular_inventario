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
import { Marca } from '../../../interfaces/marca';
import { MarcaService } from '../../../services/marca.service';
import { FormMarcaComponent } from '../../crud-marca/form-marca/form-marca.component';
import { FormSupplierComponent } from '../../crud-supplier/form-supplier/form-supplier.component';
import { MatIconModule } from '@angular/material/icon';
import { SupplierService } from '../../../services/supplier.service';
import { Supplier } from '../../../interfaces/supplier';
import { IconComponent } from "../../../shared/dasboard/icon/icon.component";
import { FormCategoryComponent } from '../../crud-category/form-category/form-category/form-category.component';
import { TipoIva, TIPOS_IVA, resolverTipoIva } from '../../../interfaces/tipo-iva';



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
    IconComponent
],
  templateUrl: './form-product.component.html',
  styleUrl: './form-product.component.css',
})
export class FormProductComponent implements OnInit {

  protected readonly value = signal('');
  calculatedSalePrice: number = 0;
  precioVentaManual = false;
  editarPrecioVenta = false;
  gananciaCalculada = 0;
  readonly tiposIva = TIPOS_IVA;

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
      status: [true],
      tipoIva: ['IVA_21' as TipoIva, Validators.required],
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
            tipoIva: resolverTipoIva(datos),
            stock: datos.stock,
            stockMin: datos.stockMin,
            salePrice: datos.salePrice,
            productUsefulness: datos.productUsefulness,
          });
          this.calculatedSalePrice = Number(datos.salePrice || 0);
          this.precioVentaManual = true;
        });
    }

    ['price', 'productUsefulness', 'tipoIva'].forEach((controlName) => {
      this.formGroup.get(controlName)?.valueChanges.subscribe(() => {
        if (!this.precioVentaManual) this.calcularPrecioAutomatico();
      });
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
    tipoIva: TipoIva
  ): void {
    let finalPrice: number;
    // Asegúrate de que `price` y `productUsefulness` sean números
    const priceValue = Number(price);
    const usefulnessValue = Number(productUsefulness);

    if (isNaN(priceValue) || isNaN(usefulnessValue)) {
      console.error('Invalid input for price or product usefulness');
      return;
    }

    const priceWithIva = priceValue * (1 + this.obtenerPorcentajeIva(tipoIva) / 100);
    finalPrice = priceWithIva + (priceWithIva * usefulnessValue) / 100;

    this.calculatedSalePrice = finalPrice;
    this.gananciaCalculada = finalPrice - priceWithIva;
    this.formGroup.patchValue({ salePrice: finalPrice }, { emitEvent: false});
  }

  calcularPrecioAutomatico(): void {
    this.precioVentaManual = false;
    this.editarPrecioVenta = false;
    this.calculateSalePrice(
      this.formGroup.get('price')?.value,
      this.formGroup.get('productUsefulness')?.value,
      this.formGroup.get('tipoIva')?.value,
    );
  }

  habilitarEdicionPrecio(): void {
    this.editarPrecioVenta = true;
    this.precioVentaManual = true;
  }

  onPrecioVentaManual(event: Event): void {
    if (!this.editarPrecioVenta) return;
    const precioFinal = Number((event.target as HTMLInputElement).value);
    const costo = Number(this.formGroup.get('price')?.value || 0);
    const costoBase = costo * (1 + this.obtenerPorcentajeIva(this.formGroup.get('tipoIva')?.value) / 100);
    if (!Number.isFinite(precioFinal) || costoBase <= 0) return;

    this.precioVentaManual = true;
    this.calculatedSalePrice = precioFinal;
    this.gananciaCalculada = precioFinal - costoBase;
    const utilidad = ((precioFinal - costoBase) / costoBase) * 100;
    this.formGroup.get('productUsefulness')?.setValue(Number(utilidad.toFixed(2)), { emitEvent: false });
  }

  private obtenerPorcentajeIva(tipoIva: TipoIva): number { return this.tiposIva.find(tipo => tipo.value === tipoIva)?.porcentaje ?? 21; }

  redondearPrecioVenta(): void {
    const precioActual = Number(this.formGroup.get('salePrice')?.value ?? this.calculatedSalePrice);
    if (!Number.isFinite(precioActual) || precioActual <= 0) {
      this.toastr.warning('Primero ingresá costo y utilidad para calcular el precio.');
      return;
    }
    const redondeado = Math.round(precioActual);
    this.precioVentaManual = true;
    this.editarPrecioVenta = true;
    this.calculatedSalePrice = redondeado;
    this.formGroup.get('salePrice')?.setValue(redondeado);
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

  createCategoria() {
    const dialogRef = this.dialog.open(FormCategoryComponent, {
      disableClose: true,
      autoFocus: true,
      hasBackdrop: true,
      closeOnNavigation: false,
      data: {
        tipo: 'createCategory',
      },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.loadCategories();
    });
  }

}

