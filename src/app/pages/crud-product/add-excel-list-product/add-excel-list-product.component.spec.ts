import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { AddExcelListProductComponent } from './add-excel-list-product.component';

describe('AddExcelListProductComponent', () => {
  const setup = () => {
    const upload = { uploadFile: jasmine.createSpy('uploadFile') };
    const toast = jasmine.createSpyObj('toast', ['success', 'error', 'info']);
    const suppliers = { getAllSuppliers: jasmine.createSpy('getAllSuppliers').and.returnValue(of([])) };
    const component = new AddExcelListProductComponent(upload as any, toast as any, suppliers as any);
    component.selectedFile = new File(['x'], 'productos.xlsx');
    component.selectedSupplierId = 7;
    return { component, upload, toast };
  };

  it('envía el archivo y providerId al endpoint de importación y muestra el resumen real', () => {
    const { component, upload, toast } = setup();
    upload.uploadFile.and.returnValue(of(new HttpResponse({ body: { message: 'OK. Creados: 1, actualizados: 2, sin cambios: 3' } })));
    component.onUpload();
    expect(upload.uploadFile).toHaveBeenCalledWith(component.selectedFile, 7);
    expect(toast.success).toHaveBeenCalledWith('OK. Creados: 1, actualizados: 2, sin cambios: 3');
  });

  it('muestra el error humano devuelto por backend y no informa éxito', () => {
    const { component, upload, toast } = setup();
    upload.uploadFile.and.returnValue(throwError(() => new HttpErrorResponse({ status: 400, error: { message: 'Error en fila 2: PRICE inválido' } })));
    component.onUpload();
    expect(toast.error).toHaveBeenCalledWith('Error en fila 2: PRICE inválido');
    expect(toast.success).not.toHaveBeenCalled();
  });
});
