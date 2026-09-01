import { InicioCardsBancosComponent } from './cards-info/inicio-card-bancos/inicio-cards-bancos/inicio-cards-bancos.component';
import { Component } from '@angular/core';
import { InicioCardsComponent } from "./cards-info/inicio-cards/inicio-cards.component";
import { InicioGraficoVentasComponent } from "./inicio-grafico-ventas/inicio-grafico-ventas.component";
import { CommonModule } from '@angular/common';
import { MatIconModule } from "@angular/material/icon";
import { InicioUltimasVentasComponent } from "./cards-info/inicio-ultimas-ventas/inicio-ultimas-ventas.component";
import { BajoStockComponent } from "./bajo-stock/bajo-stock.component";
import { InicioBajoStockComponent } from "./cards-info/inicio-bajo-stock/inicio-bajo-stock.component";
import { RouterLink } from '@angular/router';
import { TokenService } from '../../../../services/token.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [InicioCardsComponent, InicioGraficoVentasComponent,
    InicioCardsBancosComponent, CommonModule, MatIconModule, InicioUltimasVentasComponent, BajoStockComponent, InicioBajoStockComponent, RouterLink],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {
  today = new Date();
  readonly username = this.token.getUserName();
  readonly permisos = this.token.getPermissions();
  readonly roles = this.token.getAuthorities();
  constructor(private readonly token: TokenService) {}
  get nombreUsuario(): string { const nombre = this.username.split('@')[0].replace(/[._-]/g, ' '); return nombre ? nombre.replace(/\b\w/g, (letra: string) => letra.toUpperCase()) : 'Usuario'; }
  get rolUsuario(): string { const rol = this.roles[0]?.replace(/^ROLE_/, '').replaceAll('_', ' ').toLowerCase() || 'usuario'; return rol.charAt(0).toUpperCase() + rol.slice(1); }
  puede(permiso: string): boolean { return this.token.hasPermission(permiso); }
}
