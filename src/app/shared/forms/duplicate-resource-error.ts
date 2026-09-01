import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
export interface DuplicateResourceError { error:'DUPLICATE_RESOURCE';field:string;message:string; }
const duplicateFieldMap:Record<string,string>={cuit:'cuit',dni:'dni',email:'email',barCode:'barCode'};
export function applyDuplicateResourceError(error:HttpErrorResponse,form:FormGroup):string|null {
  const body=error.error as Partial<DuplicateResourceError>|null;
  if(error.status!==409||body?.error!=='DUPLICATE_RESOURCE'||!body.field)return null;
  const control=form.get(duplicateFieldMap[body.field]||body.field);
  if(control){control.setErrors({...control.errors,duplicate:true});control.markAsTouched();}
  return body.message||'Ya existe un registro con esos datos.';
}
