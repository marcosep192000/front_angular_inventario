import { ReporteDetalleComponent } from './reporte-detalle.component';
import { formatInventoryQuantity, inventoryColumns } from './inventory-report.utils';

describe('reportes de inventario modernos', () => {
  const component=()=>{const c=Object.create(ReporteDetalleComponent.prototype) as ReporteDetalleComponent;c.endpoint='inventario/stock-valorizado';return c;};
  it('formatea cantidades sin truncar ni convertir ventas de unidades a dinero', () => {
    const c=component();
    expect(c.formatearCelda('availableStock',5.5)).toBe('5,5');
    expect(c.formatearCelda('minimumStock',.25)).toBe('0,25');
    expect(c.formatearCelda('unidadesStock',7.75)).toBe('7,75');
    expect(c.formatearCelda('ventasUltimos30Dias',1.250001)).toBe('1,250001');
    expect(formatInventoryQuantity(5)).toBe('5');
  });
  it('no presenta columnas legacy junto al contrato canónico', () => {
    const row={nombre:'Producto',codigo:null,availableStock:13,minimumStock:2.5,variantStockManaged:true,stock:113,stockActual:113,stockMinimo:99};
    const c=component();c.datos={detalle:[row]};
    expect(c.columnas).toEqual(['nombre','codigo','availableStock','minimumStock','variantStockManaged']);
    expect(inventoryColumns(row)).not.toContain('stock');expect(c.formatearCelda('codigo',null)).toBe('-');
    expect(c.formatearCelda('availableStock',row.availableStock)).toBe('13');
  });
  it('conserva paginación existente y títulos legibles', () => {
    const c=component();c.filtros={page:2};c.datos={contenido:[],pagina:2,totalPaginas:5};
    expect(c.pagina).toBe(2);expect(c.totalPaginas).toBe(5);
    expect(c.etiqueta('availableStock')).toBe('Stock');expect(c.etiqueta('minimumStock')).toBe('Stock mín.');
  });
});
