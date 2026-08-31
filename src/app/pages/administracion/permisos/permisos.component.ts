import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { ToastrService } from 'ngx-toastr';
import { PermisoEmpresa, RolUsuario, UsuarioEmpresa } from '../../../interfaces/administracion';
import { AdministracionService } from '../../../services/administracion.service';

@Component({
  selector: 'app-permisos',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCheckboxModule, MatIconModule, MatSelectModule],
  templateUrl: './permisos.component.html',
  styleUrl: './permisos.component.css',
})
export class PermisosComponent implements OnInit {
  readonly roles: RolUsuario[] = ['ADMIN', 'VENDEDOR', 'COMPRADOR'];
  readonly catalogoBase: PermisoEmpresa[] = [
    ['DASHBOARD_VER', 'Ver tablero', 'General'], ['VENTAS_VER', 'Ver ventas', 'Ventas'], ['VENTAS_CREAR', 'Crear ventas', 'Ventas'], ['PRESUPUESTOS_CREAR', 'Crear presupuestos', 'Ventas'],
    ['CLIENTES_VER', 'Ver clientes', 'Clientes'], ['CLIENTES_CREAR', 'Crear clientes', 'Clientes'], ['CLIENTES_EDITAR', 'Editar clientes', 'Clientes'], ['CLIENTES_ELIMINAR', 'Eliminar clientes', 'Clientes'],
    ['PRODUCTOS_VER', 'Ver productos', 'Productos'], ['PRODUCTOS_CREAR', 'Crear productos', 'Productos'], ['PRODUCTOS_EDITAR', 'Editar productos', 'Productos'], ['PRODUCTOS_ELIMINAR', 'Eliminar productos', 'Productos'],
    ['PROVEEDORES_VER', 'Ver proveedores', 'Proveedores'], ['PROVEEDORES_CREAR', 'Crear proveedores', 'Proveedores'], ['PROVEEDORES_EDITAR', 'Editar proveedores', 'Proveedores'], ['PROVEEDORES_ELIMINAR', 'Eliminar proveedores', 'Proveedores'], ['COMPRAS_REGISTRAR', 'Registrar compras', 'Proveedores'],
    ['CAJA_VER', 'Ver caja', 'Caja'], ['CAJA_OPERAR', 'Operar caja', 'Caja'], ['CAJA_CERRAR', 'Cerrar caja', 'Caja'], ['REPORTES_VER', 'Ver reportes', 'Reportes'],
    ['EMPLEADOS_GESTIONAR', 'Gestionar empleados', 'Administración'], ['EMPRESA_CONFIGURAR', 'Configurar empresa', 'Administración'], ['USUARIOS_GESTIONAR', 'Gestionar usuarios', 'Administración'], ['PERMISOS_GESTIONAR', 'Gestionar permisos', 'Administración'],
  ].map(([codigo, nombre, grupo]) => ({ codigo, nombre, grupo }));

  usuarios: UsuarioEmpresa[] = [];
  permisos: PermisoEmpresa[] = [];
  usuario: UsuarioEmpresa | null = null;
  seleccionados = new Set<string>();
  cargando = true;
  guardando = false;
  backendDisponible = true;

  constructor(private readonly api: AdministracionService, private readonly toastr: ToastrService) {}

  ngOnInit(): void {
    this.api.listarUsuarios().subscribe({ next: usuarios => this.usuarios = usuarios, error: () => this.toastr.error('No se pudieron cargar los usuarios.') });
    this.api.listarPermisos().subscribe({
      next: permisos => { this.permisos = permisos?.length ? permisos : this.catalogoBase; this.cargando = false; },
      error: () => { this.permisos = this.catalogoBase; this.backendDisponible = false; this.cargando = false; },
    });
  }

  seleccionarUsuario(id: number): void {
    this.usuario = this.usuarios.find(usuario => usuario.id === Number(id)) || null;
    this.seleccionados.clear();
    if (!this.usuario) return;
    this.cargando = true;
    this.api.obtenerPermisosUsuario(this.usuario.id).subscribe({
      next: respuesta => { this.seleccionados = new Set(respuesta.permissions || []); this.backendDisponible = true; this.cargando = false; },
      error: () => { this.aplicarPlantilla(this.usuario!.role, false); this.backendDisponible = false; this.cargando = false; },
    });
  }

  get grupos(): string[] { return [...new Set(this.permisos.map(permiso => permiso.grupo))]; }
  porGrupo(grupo: string): PermisoEmpresa[] { return this.permisos.filter(permiso => permiso.grupo === grupo); }
  activo(codigo: string): boolean { return this.seleccionados.has(codigo); }
  cambiar(codigo: string, activo: boolean): void { activo ? this.seleccionados.add(codigo) : this.seleccionados.delete(codigo); }
  grupoCompleto(grupo: string): boolean { const items = this.porGrupo(grupo); return !!items.length && items.every(item => this.activo(item.codigo)); }
  cambiarGrupo(grupo: string, activo: boolean): void { this.porGrupo(grupo).forEach(item => this.cambiar(item.codigo, activo)); }

  aplicarPlantilla(rol: RolUsuario, avisar = true): void {
    const vendedor = ['DASHBOARD_VER', 'VENTAS_VER', 'VENTAS_CREAR', 'PRESUPUESTOS_CREAR', 'CLIENTES_VER', 'CLIENTES_CREAR', 'PRODUCTOS_VER'];
    const comprador = ['DASHBOARD_VER', 'PRODUCTOS_VER', 'PRODUCTOS_CREAR', 'PRODUCTOS_EDITAR', 'PROVEEDORES_VER', 'PROVEEDORES_CREAR', 'PROVEEDORES_EDITAR', 'COMPRAS_REGISTRAR'];
    this.seleccionados = new Set(rol === 'ADMIN' ? this.permisos.map(item => item.codigo) : rol === 'COMPRADOR' ? comprador : vendedor);
    if (avisar) this.toastr.info(`Plantilla ${rol} aplicada. Revisá los permisos antes de guardar.`);
  }

  guardar(): void {
    if (!this.usuario || this.guardando) return;
    this.guardando = true;
    this.api.guardarPermisosUsuario(this.usuario.id, { role: this.usuario.role, permissions: [...this.seleccionados] }).subscribe({
      next: respuesta => { this.seleccionados = new Set(respuesta.permissions || []); this.backendDisponible = true; this.guardando = false; this.toastr.success('Permisos guardados.'); },
      error: error => { this.backendDisponible = false; this.guardando = false; this.toastr.error(error?.error?.error || 'El backend de permisos todavía no está disponible.'); },
    });
  }
}
