import { Component, Inject, OnDestroy, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
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
import { IconComponent } from '../../../shared/dasboard/icon/icon.component';
import { FormCategoryComponent } from '../../crud-category/form-category/form-category/form-category.component';
import {
  TipoIva,
  TIPOS_IVA,
  resolverTipoIva,
} from '../../../interfaces/tipo-iva';
import { applyDuplicateResourceError } from '../../../shared/forms/duplicate-resource-error';
import { InventoryConfigComponent } from '../inventory-config/inventory-config.component';
import { ProductSuppliersDialogComponent } from '../product-suppliers/product-suppliers-dialog.component';
import { DialogGenericComponent } from '../../../shared/genericsComponents/dialog-generic/dialog-generic.component';
import { catchError, finalize, forkJoin, map, of, switchMap, timeout } from 'rxjs';
import { InventoryService } from '../../../services/inventory.service';
import { UnitOfMeasure } from '../../../interfaces/inventory';
import { normalizeOptionalBarcode } from './product-form.utils';
import { ProductImage } from '../../../interfaces/product-image';
import { GastronomyGroup, GastronomyOption, GastronomySelectionType } from '../../../interfaces/gastronomy';
import { GastronomyService } from '../../../services/gastronomy.service';

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
    IconComponent,
  ],
  templateUrl: './form-product.component.html',
  styleUrl: './form-product.component.css',
})
export class FormProductComponent implements OnInit, OnDestroy {
  protected readonly value = signal('');
  calculatedSalePrice: number = 0;
  precioVentaManual = false;
  editarPrecioVenta = false;
  gananciaCalculada = 0;
  readonly tiposIva = TIPOS_IVA;
  loadingProduct = false;
  saving = false;
  units: UnitOfMeasure[] = [];
  productImages: ProductImage[] = [];
  loadingImages = false;
  uploadingImage = false;
  readonly acceptedImageTypes = 'image/jpeg,image/png,image/webp';
  readonly maxImageSizeBytes = 5 * 1024 * 1024;
  gastronomyGroups: GastronomyGroup[] = [];
  loadingGastronomy = false;
  showGroupEditor = false;
  editingGroup: GastronomyGroup | null = null;
  editingOptionGroup: GastronomyGroup | null = null;
  editingOption: GastronomyOption | null = null;
  readonly gastronomyTypes: { value: GastronomySelectionType; label: string }[] = [{ value: 'SINGLE', label: 'Selección única' }, { value: 'MULTIPLE', label: 'Selección múltiple' }];
  groupForm = this.fb.group({ name: ['', Validators.required], description: [''], selectionType: ['MULTIPLE' as GastronomySelectionType, Validators.required], minSelections: [0, [Validators.required, Validators.min(0)]], maxSelections: [1, [Validators.required, Validators.min(1)]], required: [false], sortOrder: [0, [Validators.required, Validators.min(0)]] });
  optionForm = this.fb.group({ name: ['', Validators.required], description: [''], priceAdjustment: [0, [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]], sortOrder: [0, [Validators.required, Validators.min(0)]] });

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
    private supplierService: SupplierService,
    private inventoryService: InventoryService,
    private gastronomyService: GastronomyService,
  ) {
    this.formGroup = this.fb.group({
      category: [1],
      marca: [1],
      provider: [1],
      barCode: [''],
      name: ['', Validators.required],
      price: [
        '',
        [
          Validators.required,
          Validators.pattern('^\\d*\\.?\\d*$'), // Acepta números decimales
        ],
      ],
      stock: ['', [Validators.required, Validators.min(0)]],
      stockMin: ['', [Validators.required, Validators.min(0)]],
      baseUnitId: [
        null,
        this.data.tipo === 'createProduct' ? Validators.required : [],
      ],
      status: [true],
      cloudPublished: [false],
      tipoIva: ['IVA_21' as TipoIva, Validators.required],
      salePrice: [null, Validators.required],
      productUsefulness: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadMarcas();
    this.loadSuplier();
    this.loadUnits();

    if (this.data.updateProduct != null) {
      this.loadingProduct = true;
      this.productService
        .findById(this.data.updateProduct)
        .pipe(finalize(() => (this.loadingProduct = false)))
        .subscribe({
          next: (datos) => {
            this.formGroup.patchValue({
              category:
                datos.category?.id ?? this.formGroup.get('category')?.value,
              marca: datos.marca?.id ?? this.formGroup.get('marca')?.value,
              provider:
                datos.provider?.id ?? this.formGroup.get('provider')?.value,
              barCode: datos.barCode ?? '',
              name: datos.name,
              price: datos.price,
              tipoIva: resolverTipoIva(datos),
              stock: datos.availableStock,
              stockMin: datos.minimumStock,
              salePrice: datos.salePrice,
              productUsefulness: datos.productUsefulness,
              cloudPublished: datos.cloudPublished === true,
            });
            this.calculatedSalePrice = Number(datos.salePrice || 0);
            this.precioVentaManual = true;
          },
          error: (error: HttpErrorResponse) => {
            this.toastr.error(
              error.error?.message || 'No se pudieron cargar los datos del producto.',
            );
          },
        });
      this.loadImages();
      this.loadGastronomy();
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

  loadUnits(): void {
    this.inventoryService.getUnits().subscribe({
      next: (units) => {
        this.units = units;
        if (this.data.tipo !== 'createProduct') return;
        const defaultUnit =
          units.find((unit) => unit.name.toUpperCase() === 'UNIDAD') ||
          units.find((unit) => unit.dimension === 'COUNT') ||
          units[0];
        if (defaultUnit)
          this.formGroup.get('baseUnitId')?.setValue(defaultUnit.id);
      },
      error: () =>
        this.toastr.error(
          'No se pudieron cargar las unidades. No es posible crear el producto.',
        ),
    });
  }

  loadImages(): void {
    const productId = Number(this.data.updateProduct);
    if (!productId) return;
    this.loadingImages = true;
    this.productService.getImages(productId)
      .pipe(
        switchMap((images) =>
          forkJoin(
            images.map((image) =>
              this.productService.getImageContent(productId, image.id).pipe(
                map((blob) => {
                  if (!blob.size) throw new Error('Imagen vacía');
                  return { ...image, previewUrl: URL.createObjectURL(blob) };
                }),
                // Una miniatura fallida no debe impedir mostrar las demás.
                catchError(() => of({ ...image, previewUrl: undefined })),
              ),
            ),
          ),
        ),
      )
      .pipe(finalize(() => (this.loadingImages = false)))
      .subscribe({
        next: (images) => {
          this.releaseImageUrls();
          this.productImages = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
        },
        error: () => this.toastr.error('No se pudieron cargar las imágenes del producto.'),
      });
  }

  ngOnDestroy(): void {
    this.releaseImageUrls();
  }

  private releaseImageUrls(): void {
    this.productImages.forEach((image) => {
      if (image.previewUrl) URL.revokeObjectURL(image.previewUrl);
    });
  }

  loadGastronomy(): void {
    const productId = Number(this.data.updateProduct); if (!productId) return;
    this.loadingGastronomy = true;
    this.gastronomyService.groups(productId).pipe(finalize(() => this.loadingGastronomy = false)).subscribe({ next: groups => this.gastronomyGroups = [...groups].sort((a, b) => a.sortOrder - b.sortOrder), error: () => this.toastr.error('No se pudo cargar la configuración gastronómica.') });
  }
  openGroup(group?: GastronomyGroup): void {
    this.editingGroup = group ?? null;
    this.showGroupEditor = true;
    this.groupForm.reset(group ? { name: group.name, description: group.description || '', selectionType: group.selectionType, minSelections: group.minSelections, maxSelections: group.maxSelections, required: group.required, sortOrder: group.sortOrder } : { selectionType: 'MULTIPLE', minSelections: 0, maxSelections: 1, required: false, sortOrder: this.gastronomyGroups.length });
  }
  saveGroup(): void {
    const value = this.groupForm.getRawValue();
    if (this.groupForm.invalid || Number(value.minSelections) > Number(value.maxSelections) || (value.selectionType === 'SINGLE' && Number(value.maxSelections) > 1) || (value.required && Number(value.minSelections) < 1)) { this.groupForm.markAllAsTouched(); this.toastr.warning('Revisá las selecciones mínimas y máximas del grupo.'); return; }
    const body = { ...value, description: value.description || null } as any;
    const request = this.editingGroup ? this.gastronomyService.updateGroup(this.data.updateProduct, this.editingGroup.id, body) : this.gastronomyService.createGroup(this.data.updateProduct, body);
    request.subscribe({ next: () => { this.editingGroup = null; this.showGroupEditor = false; this.loadGastronomy(); }, error: () => this.toastr.error('No se pudo guardar el grupo.') });
  }
  openOption(group: GastronomyGroup, option?: GastronomyOption): void { this.editingOptionGroup = group; this.editingOption = option ?? null; this.optionForm.reset(option ? { name: option.name, description: option.description || '', priceAdjustment: option.priceAdjustment, sortOrder: option.sortOrder } : { priceAdjustment: 0, sortOrder: group.options?.length || 0 }); }
  saveOption(): void {
    if (!this.editingOptionGroup || this.optionForm.invalid) { this.optionForm.markAllAsTouched(); return; }
    const value = this.optionForm.getRawValue(); const body = { ...value, priceAdjustment: Number(value.priceAdjustment), description: value.description || null } as any;
    const request = this.editingOption ? this.gastronomyService.updateOption(this.data.updateProduct, this.editingOptionGroup.id, this.editingOption.id, body) : this.gastronomyService.createOption(this.data.updateProduct, this.editingOptionGroup.id, body);
    request.subscribe({ next: () => { this.editingOptionGroup = null; this.editingOption = null; this.loadGastronomy(); }, error: () => this.toastr.error('No se pudo guardar la opción.') });
  }
  deleteGroup(group: GastronomyGroup): void {
    this.confirmGastronomyDeletion(`¿Eliminar el grupo “${group.name}” y sus opciones?`, () => this.gastronomyService.deleteGroup(this.data.updateProduct, group.id).subscribe({ next: () => this.loadGastronomy(), error: () => this.toastr.error('No se pudo eliminar el grupo.') }));
  }
  deleteOption(group: GastronomyGroup, option: GastronomyOption): void {
    this.confirmGastronomyDeletion(`¿Eliminar la opción “${option.name}”?`, () => this.gastronomyService.deleteOption(this.data.updateProduct, group.id, option.id).subscribe({ next: () => this.loadGastronomy(), error: () => this.toastr.error('No se pudo eliminar la opción.') }));
  }
  private confirmGastronomyDeletion(message: string, confirmedAction: () => void): void {
    this.dialog.open(DialogGenericComponent, { width: '430px', maxWidth: '94vw', data: { state: 'Eliminar', icon: 'warning', message } }).afterClosed().subscribe((confirmed) => { if (confirmed === true) confirmedAction(); });
  }

  uploadProductImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      this.toastr.warning('Elegí una imagen JPG, PNG o WEBP.');
      return;
    }
    if (file.size > this.maxImageSizeBytes) {
      this.toastr.warning('La imagen no puede superar los 5 MB.');
      return;
    }
    this.uploadingImage = true;
    this.productService.uploadImage(this.data.updateProduct, file)
      .pipe(finalize(() => (this.uploadingImage = false)))
      .subscribe({
        next: () => {
          this.toastr.success('Imagen agregada correctamente.');
          this.loadImages();
        },
        error: (error: HttpErrorResponse) => this.toastr.error(error.error?.message || 'No se pudo subir la imagen.'),
      });
  }

  setPrincipalImage(image: ProductImage): void {
    if (image.principal) return;
    this.productService.setPrincipalImage(this.data.updateProduct, image.id).subscribe({
      next: () => { this.toastr.success('Imagen principal actualizada.'); this.loadImages(); },
      error: (error: HttpErrorResponse) => this.toastr.error(error.error?.message || 'No se pudo definir la imagen principal.'),
    });
  }

  moveImage(image: ProductImage, direction: -1 | 1): void {
    const index = this.productImages.findIndex((item) => item.id === image.id);
    const neighbor = this.productImages[index + direction];
    if (!neighbor) return;
    this.productService.setImageOrder(this.data.updateProduct, image.id, neighbor.sortOrder).subscribe({
      next: () => this.loadImages(),
      error: () => this.toastr.error('No se pudo cambiar el orden de la imagen.'),
    });
  }

  deleteProductImage(image: ProductImage): void {
    this.productService.deleteImage(this.data.updateProduct, image.id).subscribe({
      next: () => {
        this.toastr.success('Imagen eliminada.');
        this.loadImages();
      },
      error: (error: HttpErrorResponse) => this.toastr.error(error.error?.message || 'No se pudo eliminar la imagen.'),
    });
  }

  cancel() {
    if (!this.formGroup.dirty) {
      this.dialogRef.close();
      return;
    }
    this.dialog
      .open(DialogGenericComponent, {
        width: '430px',
        maxWidth: '94vw',
        data: {
          state: 'Descartar cambios',
          icon: 'warning',
          message: 'Hay cambios sin guardar. ¿Querés cerrar igualmente?',
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed === true) this.dialogRef.close();
      });
  }

  save(): void {
    if (this.saving) return;
    if (this.formGroup.valid) {
      this.saving = true;
      const { baseUnitId, ...rawProductPayload } = this.formGroup.getRawValue();
      const productPayload = this.normalizeProductPayload(rawProductPayload);
      this.productService
        // Initial quantities are canonical; zero aliases keep old HTTP clients compatible.
        .save({ ...productPayload, stock: 0, stockMin: 0,
          stockQuantity: Number(productPayload.stock),
          minimumStockQuantity: Number(productPayload.stockMin) })
        .pipe(
          // Conserva compatibilidad con versiones anteriores del backend que
          // no devolvían el producto creado.
          switchMap((product) =>
            product?.id
              ? of(product)
              : productPayload.barCode
                ? this.productService.findAdministrativeByBarcode(
                    productPayload.barCode,
                  )
                : (() => {
                    throw new Error(
                      'El producto se creó, pero el servidor no devolvió su identificador.',
                    );
                  })(),
          ),
          switchMap((product) => {
            const productId = product.id;
            if (!productId || !baseUnitId)
              throw new Error('El producto se creó, pero no se pudo identificar para configurar su stock.');
            return this.inventoryService
              .updateBaseUnit(productId, {
                unitId: Number(baseUnitId),
                stock: Number(productPayload.stock),
                minimumStock: Number(productPayload.stockMin),
                fractionable: false,
                variantStockManaged: false,
              })
              .pipe(map(() => product));
          }),
        )
        .pipe(finalize(() => (this.saving = false)))
        .subscribe({
          next: (data) => {
            this.toastr.success('Producto guardado correctamente.');
            this.dialogRef.close({ saved: true, data });
          },
          error: (error: HttpErrorResponse) => this.handleSaveError(error),
        });
    } else {
      this.formGroup.markAllAsTouched();
      this.focusFirstInvalid();
      this.toastr.error(
        'Por favor, complete todos los campos requeridos!',
        '',
        {
          timeOut: 5000,
          positionClass: 'toast-bottom-right',
        },
      );
    }
  }

  update(): void {
    if (this.saving) return;
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      this.focusFirstInvalid();
      this.toastr.warning('Revisá los campos marcados antes de guardar.');
      return;
    }
    this.saving = true;
    const productPayload = this.normalizeProductPayload(
      this.formGroup.getRawValue(),
    );
    delete productPayload.stock;
    delete productPayload.stockMin;
    this.productService
      .update(this.data.updateProduct, productPayload)
      .pipe(
        timeout(20000),
        finalize(() => (this.saving = false)),
      )
      .subscribe({
        next: (data) => {
          this.toastr.success('Producto actualizado correctamente.');
          this.dialogRef.close({ saved: true, data });
        },
        error: (error: HttpErrorResponse) => this.handleSaveError(error),
      });
  }

  private handleSaveError(error: HttpErrorResponse): void {
    const duplicate = applyDuplicateResourceError(error, this.formGroup);
    this.toastr.error(
      (duplicate ? 'El código de barras ya está siendo utilizado por otro producto.' : null) ||
        error.error?.message ||
        error.error?.error ||
        'No se pudo guardar el producto.',
    );
  }

  private normalizeProductPayload(payload: any): any {
    return { ...payload, barCode: normalizeOptionalBarcode(payload.barCode) };
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

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.saved) this.loadMarcas();
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
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.saved) this.loadSuplier();
    });
  }

  calculateSalePrice(
    price: number,
    productUsefulness: number,
    tipoIva: TipoIva,
  ): void {
    let finalPrice: number;
    // Asegúrate de que `price` y `productUsefulness` sean números
    const priceValue = Number(price);
    const usefulnessValue = Number(productUsefulness);

    if (isNaN(priceValue) || isNaN(usefulnessValue)) {
      console.error('Invalid input for price or product usefulness');
      return;
    }

    const priceWithIva =
      priceValue * (1 + this.obtenerPorcentajeIva(tipoIva) / 100);
    finalPrice = priceWithIva + (priceWithIva * usefulnessValue) / 100;

    this.calculatedSalePrice = finalPrice;
    this.gananciaCalculada = finalPrice - priceWithIva;
    this.formGroup.patchValue({ salePrice: finalPrice }, { emitEvent: false });
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
    const costoBase =
      costo *
      (1 +
        this.obtenerPorcentajeIva(this.formGroup.get('tipoIva')?.value) / 100);
    if (!Number.isFinite(precioFinal) || costoBase <= 0) return;

    this.precioVentaManual = true;
    this.calculatedSalePrice = precioFinal;
    this.gananciaCalculada = precioFinal - costoBase;
    const utilidad = ((precioFinal - costoBase) / costoBase) * 100;
    this.formGroup
      .get('productUsefulness')
      ?.setValue(Number(utilidad.toFixed(2)), { emitEvent: false });
  }

  private obtenerPorcentajeIva(tipoIva: TipoIva): number {
    return (
      this.tiposIva.find((tipo) => tipo.value === tipoIva)?.porcentaje ?? 21
    );
  }

  redondearPrecioVenta(): void {
    const precioActual = Number(
      this.formGroup.get('salePrice')?.value ?? this.calculatedSalePrice,
    );
    if (!Number.isFinite(precioActual) || precioActual <= 0) {
      this.toastr.warning(
        'Primero ingresá costo y utilidad para calcular el precio.',
      );
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
    const raw = input.value.replace(/,/g, '.').replace(/[^0-9.]/g, '');
    const parts = raw.split('.');
    const filteredValue =
      parts.length > 1 ? `${parts.shift()}.${parts.join('')}` : raw;
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

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.saved) this.loadCategories();
    });
  }

  openInventoryConfig(): void {
    if (!this.data.updateProduct) return;
    this.dialog
      .open(InventoryConfigComponent, {
        width: '900px',
        maxWidth: '97vw',
        autoFocus: false,
        disableClose: true,
        data: {
          productId: this.data.updateProduct,
          productName: this.formGroup.get('name')?.value || 'Producto',
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result?.changed) {
          this.formGroup.patchValue({
            stock: Math.max(0, Number(result.availableStock)),
            stockMin: Math.max(0, Number(result.minimumStock)),
          });
        }
      });
  }

  openProductSuppliers(): void {
    if (!this.data.updateProduct) return;
    this.dialog.open(ProductSuppliersDialogComponent, {
      width: '820px',
      maxWidth: '97vw',
      autoFocus: false,
      disableClose: true,
      data: {
        productId: this.data.updateProduct,
        productName: this.formGroup.get('name')?.value || 'Producto',
      },
    });
  }
  private focusFirstInvalid(): void {
    setTimeout(() =>
      document
        .querySelector<HTMLElement>(
          '.product-form .ng-invalid[formControlName]',
        )
        ?.focus(),
    );
  }
}
