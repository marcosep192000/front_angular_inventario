import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

interface AreaReporte { titulo: string; icono: string; color: string; items: { nombre: string; ruta?: string; disponible?: boolean }[]; }

@Component({ selector: 'app-reportes', standalone: true, imports: [CommonModule, RouterLink, MatIconModule], templateUrl: './reportes.component.html', styleUrl: './reportes.component.css' })
export class ReportesComponent {
  readonly areas: AreaReporte[] = [
    { titulo: 'Ventas', icono: 'point_of_sale', color: 'ventas', items: [{ nombre: 'Resumen de ventas', ruta: 'ventas/resumen' }, { nombre: 'Ventas por producto', ruta: 'ventas/productos' }, { nombre: 'Ranking de productos', ruta: 'ventas/ranking-productos' }] },
    { titulo: 'Clientes', icono: 'groups', color: 'clientes', items: [{ nombre: 'Cuentas corrientes', ruta: 'clientes/cuenta-corriente' }, { nombre: 'Antigüedad de deuda', ruta: 'clientes/antiguedad-deuda' }] },
    { titulo: 'Inventario', icono: 'inventory_2', color: 'inventario', items: [{ nombre: 'Stock valorizado', ruta: 'inventario/stock-valorizado' }, { nombre: 'Bajo stock', ruta: 'inventario/bajo-stock' }, { nombre: 'Productos sin stock', ruta: 'inventario/sin-stock' }, { nombre: 'Inventario inmovilizado', ruta: 'inventario/inmovilizado' }] },
    { titulo: 'Proveedores', icono: 'local_shipping', color: 'proveedores', items: [{ nombre: 'Compras a proveedores', ruta: 'proveedores/compras' }, { nombre: 'Deuda con proveedores', ruta: 'proveedores/deuda' }, { nombre: 'Evolución de costos', ruta: 'proveedores/evolucion-costos' }] },
    { titulo: 'Caja', icono: 'account_balance_wallet', color: 'caja', items: [{ nombre: 'Resumen de caja', ruta: 'caja/resumen' }, { nombre: 'Historial de arqueos', ruta: 'caja/arqueos' }, { nombre: 'Medios de pago', ruta: 'caja/medios-pago' }] },
    { titulo: 'Fiscal', icono: 'receipt_long', color: 'fiscal', items: [{ nombre: 'Integración fiscal pendiente', disponible: false }] }
  ];
}
