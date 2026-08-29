import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

interface AreaReporte { titulo: string; icono: string; color: string; items: { nombre: string; ruta?: string; disponible?: boolean }[]; }

@Component({ selector: 'app-reportes', standalone: true, imports: [CommonModule, RouterLink, MatIconModule], templateUrl: './reportes.component.html', styleUrl: './reportes.component.css' })
export class ReportesComponent {
  readonly areas: AreaReporte[] = [
    { titulo: 'Ventas', icono: 'point_of_sale', color: 'ventas', items: [{ nombre: 'Ventas por período', ruta: 'ventas/resumen' }, { nombre: 'Ventas por producto', ruta: 'ventas/productos' }, { nombre: 'Ranking', ruta: 'ventas/ranking' }, { nombre: 'Rentabilidad', disponible: false }] },
    { titulo: 'Inventario', icono: 'inventory_2', color: 'inventario', items: [{ nombre: 'Stock valorizado', ruta: 'inventario/stock-valorizado' }, { nombre: 'Bajo stock', ruta: 'inventario/bajo-stock' }, { nombre: 'Sin movimiento', ruta: 'inventario/inmovilizado' }] },
    { titulo: 'Proveedores', icono: 'local_shipping', color: 'proveedores', items: [{ nombre: 'Compras', ruta: 'proveedores/compras' }, { nombre: 'Deuda', ruta: 'proveedores/deuda' }, { nombre: 'Evolución de costos', disponible: false }] },
    { titulo: 'Caja', icono: 'account_balance_wallet', color: 'caja', items: [{ nombre: 'Resumen de caja', ruta: 'caja/resumen' }, { nombre: 'Arqueos', disponible: false }, { nombre: 'Medios de pago', disponible: false }] },
    { titulo: 'Clientes', icono: 'groups', color: 'clientes', items: [{ nombre: 'Cuenta corriente', ruta: 'clientes/cuenta-corriente' }, { nombre: 'Antigüedad de deuda', disponible: false }, { nombre: 'Ranking', disponible: false }] },
    { titulo: 'Fiscal', icono: 'receipt_long', color: 'fiscal', items: [{ nombre: 'IVA ventas', disponible: false }, { nombre: 'IVA compras', disponible: false }, { nombre: 'ARCA', disponible: false }] }
  ];
}
