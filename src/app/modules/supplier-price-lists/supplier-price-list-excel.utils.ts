import{SupplierPriceListExcelMapping,SupplierPriceListExcelRowError}from'../../interfaces/supplier-price-list';
export const excelFileAccepted=(file:File)=>/\.(xlsx|xls)$/i.test(file.name);
export const uiRowToBackend=(row:number)=>Math.max(0,Math.floor(Number(row)||1)-1);
export const backendRowToUi=(row:number)=>row+1;
const find=(headers:string[],words:string[])=>headers.find(h=>words.some(w=>h.toLocaleLowerCase().includes(w)))??null;
export function autoMapExcel(headers:string[]):SupplierPriceListExcelMapping{return{sheet:null,headerRow:0,supplierProductCodeColumn:find(headers,['código proveedor','codigo proveedor','sku']),supplierBarcodeColumn:find(headers,['código de barras','codigo de barras','barcode','ean']),descriptionColumn:find(headers,['descripción','descripcion','producto','artículo','articulo']),offeredPriceColumn:find(headers,['precio ofrecido','precio lista','precio','importe'])??''};}
export const mappingFingerprint=(file:File,m:SupplierPriceListExcelMapping)=>`${file.name}|${file.size}|${file.lastModified}|${JSON.stringify(m)}`;
export const excelErrorMessage=(e:SupplierPriceListExcelRowError)=>e.message||({REQUIRED:'Falta un dato obligatorio.',INVALID_NUMBER:'El precio no es un número válido.',DUPLICATE:'La fila está duplicada.'}as Record<string,string>)[e.errorCode]||'La fila contiene un dato inválido.';
