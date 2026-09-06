import { costAlertLabel, nullableValue, reportErrorMessage } from './supplier-reports.utils';
describe('supplier report presentation rules',()=>{
  it('translates every cost alert',()=>{expect(costAlertLabel('NO_SUPPLIER')).toBe('Sin proveedor');expect(costAlertLabel('NO_LAST_PURCHASE_PRICE')).toBe('Sin último costo de compra');expect(costAlertLabel('PREFERRED_NOT_CHEAPEST')).toBe('Preferido no es el más barato');});
  it('shows missing comparison data instead of zero',()=>{expect(nullableValue(null)).toBe('Sin información comparable');expect(nullableValue(0)).toBe(0);});
  it('maps forbidden access without exposing technical data',()=>{expect(reportErrorMessage({status:403})).toBe('No tiene permisos para ver reportes de proveedores.');});
  it('maps not found and bad request',()=>{expect(reportErrorMessage({status:404})).toBe('Producto o proveedor no encontrado.');expect(reportErrorMessage({status:400,error:{message:'Rango inválido'}})).toBe('Rango inválido');});
});
