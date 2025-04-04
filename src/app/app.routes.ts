import { Routes } from '@angular/router';
import { ListCategoryComponent } from './pages/crud-category/list-category/list-category.component';
import { ListProductComponent } from './pages/crud-product/list-product/list-product.component';
import { ListClientComponent } from './pages/crud-client/list-client/list-client.component';
import { NewSaleComponent } from './pages/crud-sale/new-sale/new-sale.component';
import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { NavigationComponent } from './shared/dasboard/navigation/navigation.component';
import { authGuard } from './auth/guard/auth.guard';
import { CashClosingComponent } from './pages/crud-cash-closing/cash-closing/cash-closing.component';
import { SupplierService } from './services/supplier.service';
import { ListSupplierComponent } from './pages/crud-supplier/form-supplier/list-supplier/list-supplier.component';
import { InicioComponent } from './shared/dasboard/dashboard/inicio/inicio.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  // Agrupar rutas protegidas dentro del dashboa
  {
    path: 'dashboard',
    component: NavigationComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: InicioComponent, pathMatch: 'full' },
      { path: 'cash-closing', component: CashClosingComponent },
      { path: 'category-list', component: ListCategoryComponent },
      { path: 'product-list', component: ListProductComponent },
      { path: 'client-list', component: ListClientComponent },
      { path: 'new-sale', component: NewSaleComponent },
      { path: 'supplier-list', component: ListSupplierComponent },
    ],
  },
  { path: '**', redirectTo: '/login' },
];
