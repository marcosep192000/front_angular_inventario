import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NEVER, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { CategoryService } from '../../../services/category.service';
import { InventoryService } from '../../../services/inventory.service';
import { MarcaService } from '../../../services/marca.service';
import { ProductService } from '../../../services/product.service';
import { SupplierService } from '../../../services/supplier.service';
import { FormProductComponent } from './form-product.component';

describe('FormProductComponent imported products', () => {
  const importedProduct = {
    id: 47,
    barCode: null,
    name: 'ABRAZADERA BANDA 12MM',
    price: 404.09,
    salePrice: 525.32,
    productUsefulness: 30,
    availableStock: 0,
    minimumStock: 0,
    stock: 999,
    stockMin: 0,
    iva: 21,
    tipoIva: 'IVA_21',
    stateIva: true,
    category: null,
    marca: null,
    provider: { id: 7, name: 'Proveedor' },
  } as any;

  let component: FormProductComponent;
  let productService: jasmine.SpyObj<ProductService>;
  let toastr: jasmine.SpyObj<ToastrService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<FormProductComponent>>;

  beforeEach(async () => {
    productService = jasmine.createSpyObj('ProductService', ['findById', 'update', 'save']);
    productService.findById.and.returnValue(of(importedProduct));
    productService.save.and.returnValue(of(importedProduct));
    productService.update.and.returnValue(of('ok') as any);
    toastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning']);
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [FormProductComponent, NoopAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { tipo: 'updateProduct', updateProduct: 47 } },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
        { provide: ProductService, useValue: productService },
        { provide: ToastrService, useValue: toastr },
        { provide: CategoryService, useValue: { getCategories: () => of([]) } },
        { provide: MarcaService, useValue: { allMarca: () => of([]) } },
        { provide: SupplierService, useValue: { getAllSuppliers: () => of([]) } },
        { provide: InventoryService, useValue: { getUnits: () => of([]), updateBaseUnit: jasmine.createSpy('updateBaseUnit').and.returnValue(of({})) } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(FormProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads all editable data by product id even when barcode and relations are null', () => {
    expect(productService.findById).toHaveBeenCalledOnceWith(47);
    expect(component.formGroup.value).toEqual(jasmine.objectContaining({
      barCode: '',
      name: 'ABRAZADERA BANDA 12MM',
      price: 404.09,
      salePrice: 525.32,
      productUsefulness: 30,
      stock: 0,
      stockMin: 0,
      provider: 7,
    }));
  });

  it('does not send inventory fields when saving general product data', () => {
    component.formGroup.get('barCode')?.setValue('INT-0047');
    component.update();
    const payload = productService.update.calls.mostRecent().args[1];
    expect(Object.prototype.hasOwnProperty.call(payload, 'stock')).toBeFalse();
    expect(Object.prototype.hasOwnProperty.call(payload, 'stockMin')).toBeFalse();
  });

  it('sends initial decimal quantities in the modern creation contract', () => {
    component.formGroup.patchValue({ barCode: 'NEW', stock: 10.125, stockMin: 2.75, baseUnitId: 1 });
    component.save();
    expect(productService.save).toHaveBeenCalledWith(jasmine.objectContaining({
      stockQuantity: 10.125, minimumStockQuantity: 2.75, stock: 0, stockMin: 0,
    }));
    expect(TestBed.inject(InventoryService).updateBaseUnit).toHaveBeenCalledWith(47,
      jasmine.objectContaining({ stock: 10.125, minimumStock: 2.75 }));
  });

  it('envia el proveedor seleccionado en alta y edicion antes de cerrar', () => {
    component.formGroup.patchValue({ barCode: '0101', provider: 2, baseUnitId: 1 });
    component.save();
    expect(productService.save).toHaveBeenCalledWith(jasmine.objectContaining({ provider: 2, barCode: '0101' }));
    expect(dialogRef.close).toHaveBeenCalledWith(jasmine.objectContaining({ saved: true }));
    component.formGroup.patchValue({ provider: 3 });
    component.update();
    expect(productService.update).toHaveBeenCalledWith(47, jasmine.objectContaining({ provider: 3, barCode: '0101' }));
  });

  it('allows an optional barcode and preserves leading zeroes when present', () => {
    component.update();
    expect(productService.update).toHaveBeenCalledWith(47, jasmine.objectContaining({ barCode: null }));

    component.formGroup.get('barCode')?.setValue('  INT-0047  ');
    component.update();

    expect(productService.update).toHaveBeenCalledWith(
      47,
      jasmine.objectContaining({ barCode: 'INT-0047' }),
    );
  });

  it('shows a human duplicate-barcode message and keeps the edited form open', () => {
    productService.update.and.returnValue(throwError(() => new HttpErrorResponse({
      status: 409,
      error: { error: 'DUPLICATE_RESOURCE', field: 'barCode', message: 'detalle técnico' },
    })));
    component.formGroup.patchValue({ name: 'Datos conservados', barCode: '001234567890' });

    component.update();

    expect(toastr.error).toHaveBeenCalledWith('El código de barras ya está siendo utilizado por otro producto.');
    expect(component.formGroup.get('barCode')?.hasError('duplicate')).toBeTrue();
    expect(component.formGroup.get('name')?.value).toBe('Datos conservados');
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('releases saving when an update exceeds the defensive timeout', fakeAsync(() => {
    productService.update.and.returnValue(NEVER);
    component.formGroup.get('barCode')?.setValue('INT-0047');

    component.update();
    expect(component.saving).toBeTrue();

    tick(20001);
    expect(component.saving).toBeFalse();
    expect(toastr.error).toHaveBeenCalled();
  }));
});
