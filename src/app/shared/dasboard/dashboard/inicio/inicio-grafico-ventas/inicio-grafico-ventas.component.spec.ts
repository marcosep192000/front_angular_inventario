import { of, throwError } from 'rxjs';
import { InicioGraficoVentasComponent } from './inicio-grafico-ventas.component';

describe('InicioGraficoVentasComponent', () => {
  it('arma el gráfico cuando existen ventas', () => {
    const component = new InicioGraficoVentasComponent({ getVentasPorDia: () => of([
      { dia: 7, mes: 9, anio: 2026, ventas: 1250.5 },
    ]) } as any);
    component.ngOnInit();
    expect(component.error).toBeFalse();
    expect(component.loading).toBeFalse();
    expect(component.barChartData.labels).toEqual(['7/9']);
    expect(component.barChartData.datasets[0].data).toEqual([1250.5]);
  });

  it('alinea por día años con jornadas sin ventas', () => {
    const component = new InicioGraficoVentasComponent({ getVentasPorDia: () => of([
      { dia: 1, mes: 9, anio: 2025, ventas: 10 },
      { dia: 2, mes: 9, anio: 2026, ventas: 20 },
    ]) } as any);
    component.ngOnInit();
    expect(component.barChartData.labels).toEqual(['1/9', '2/9']);
    expect(component.barChartData.datasets[0].data).toEqual([10, 0]);
    expect(component.barChartData.datasets[1].data).toEqual([0, 20]);
  });

  it('distingue un período vacío de un error real', () => {
    const empty = new InicioGraficoVentasComponent({ getVentasPorDia: () => of([]) } as any);
    empty.ngOnInit();
    expect(empty.error).toBeFalse();
    expect(empty.barChartData.datasets).toEqual([]);
    const failed = new InicioGraficoVentasComponent({ getVentasPorDia: () => throwError(() => new Error('backend')) } as any);
    failed.ngOnInit();
    expect(failed.error).toBeTrue();
    expect(failed.loading).toBeFalse();
  });
});
