import { Routes } from '@angular/router';
import { ListCategoryComponent } from './pages/crud-category/list-category/list-category.component';
import { ListProductComponent } from './pages/crud-product/list-product/list-product.component';
import { ListClientComponent } from './pages/crud-client/list-client/list-client.component';
import { NewSaleComponent } from './pages/crud-sale/new-sale/new-sale.component';
import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { NavigationComponent } from './shared/dasboard/navigation/navigation.component';
import { authGuard, permissionGuard } from './auth/guard/auth.guard';
import { CashClosingComponent } from './pages/crud-cash-closing/cash-closing/cash-closing.component';
import { ListSupplierComponent } from './pages/crud-supplier/form-supplier/list-supplier/list-supplier.component';
import { InicioComponent } from './shared/dasboard/dashboard/inicio/inicio.component';
import { BajoStockComponent } from './shared/dasboard/dashboard/inicio/bajo-stock/bajo-stock.component';
import { BuscarProductoPorProveedorComponent } from './pages/crud-product/buscar-producto-por-proveedor/buscar-producto-por-proveedor.component';
import { AdministracionComponent } from './pages/administracion/administracion.component';
import { PermisosComponent } from './pages/administracion/permisos/permisos.component';
import { EmpleadosComponent } from './pages/empleados/empleados.component';
import { ReportesComponent } from './modules/reportes/reportes.component';
import { ReporteDetalleComponent } from './modules/reportes/reporte-detalle.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  // Agrupar rutas protegidas dentro del dashboa
  {
    path: 'dashboard',
    component: NavigationComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: InicioComponent, pathMatch: 'full', canActivate: [permissionGuard], data: { permission: 'DASHBOARD_VER' } },
      { path: 'cash-closing', component: CashClosingComponent, canActivate: [permissionGuard], data: { permission: 'CAJA_VER' } },
      { path: 'category-list', component: ListCategoryComponent, canActivate: [permissionGuard], data: { permission: 'PRODUCTOS_VER' } },
      { path: 'product-list', component: ListProductComponent, canActivate: [permissionGuard], data: { permission: 'PRODUCTOS_VER' } },
      { path: 'client-list', component: ListClientComponent, canActivate: [permissionGuard], data: { permission: 'CLIENTES_VER' } },
      { path: 'new-sale', component: NewSaleComponent, canActivate: [permissionGuard], data: { permission: 'VENTAS_CREAR' } },
      { path: 'supplier-list', component: ListSupplierComponent, canActivate: [permissionGuard], data: { permission: 'PROVEEDORES_VER' } },
      { path:'bajo-stock', component: BajoStockComponent, canActivate: [permissionGuard], data: { permission: 'PRODUCTOS_VER' } },
      { path:'buscar-producto-por-proveedor',component: BuscarProductoPorProveedorComponent, canActivate: [permissionGuard], data: { permission: 'PRODUCTOS_VER' } }
      ,{ path:'administracion', component: AdministracionComponent, canActivate: [permissionGuard], data: { permission: 'EMPRESA_CONFIGURAR' } }
      ,{ path:'administracion/permisos', component: PermisosComponent, canActivate: [permissionGuard], data: { permission: 'PERMISOS_GESTIONAR' } }
      ,{ path:'empleados', component: EmpleadosComponent, canActivate: [permissionGuard], data: { permission: 'EMPLEADOS_GESTIONAR' } }
      ,{ path:'reportes', component: ReportesComponent, canActivate: [permissionGuard], data: { permission: 'REPORTES_VER' } }
      ,{ path:'reportes/:area/:reporte', component: ReporteDetalleComponent, canActivate: [permissionGuard], data:{permission:'REPORTES_VER',area:'Reportes',titulo:'Reporte',descripcion:'Consulta de información',endpoint:''} }
    ],
  },
  { path: '**', redirectTo: '/login' },
];
