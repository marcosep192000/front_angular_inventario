import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup } from '@angular/forms';
import { applyDuplicateResourceError } from './duplicate-resource-error';
describe('applyDuplicateResourceError',()=>{
  it('marca el campo indicado y devuelve el mensaje del backend',()=>{const form=new FormGroup({email:new FormControl('a@b.com')});const error=new HttpErrorResponse({status:409,error:{error:'DUPLICATE_RESOURCE',field:'email',message:'Ya existe un usuario con ese email'}});expect(applyDuplicateResourceError(error,form)).toBe('Ya existe un usuario con ese email');expect(form.get('email')?.hasError('duplicate')).toBeTrue();});
  it('ignora errores que no sean duplicados',()=>{const form=new FormGroup({dni:new FormControl('1')});const error=new HttpErrorResponse({status:500,error:{message:'Error'}});expect(applyDuplicateResourceError(error,form)).toBeNull();expect(form.get('dni')?.hasError('duplicate')).toBeFalse();});
});
