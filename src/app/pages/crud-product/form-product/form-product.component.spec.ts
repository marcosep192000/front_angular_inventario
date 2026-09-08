import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
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

  beforeEach(async () => {
    productService = jasmine.createSpyObj('ProductService', ['findById', 'update', 'save']);
    productService.findById.and.returnValue(of(importedProduct));
    productService.save.and.returnValue(of(importedProduct));
    productService.update.and.returnValue(of('ok') as any);
    toastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning']);

    await TestBed.configureTestingModule({
      imports: [FormProductComponent, NoopAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { tipo: 'updateProduct', updateProduct: 47 } },
        { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) },
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

  it('blocks manual save until an internal barcode is assigned', () => {
    component.update();

    expect(component.formGroup.get('barCode')?.hasError('required')).toBeTrue();
    expect(productService.update).not.toHaveBeenCalled();
    expect(toastr.warning).toHaveBeenCalledWith('Revisá los campos marcados antes de guardar.');

    component.formGroup.get('barCode')?.setValue('  INT-0047  ');
    component.update();

    expect(productService.update).toHaveBeenCalledWith(
      47,
      jasmine.objectContaining({ barCode: 'INT-0047' }),
    );
  });
});
