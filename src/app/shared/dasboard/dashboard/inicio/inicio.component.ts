import { InicioCardsBancosComponent } from './cards-info/inicio-card-bancos/inicio-cards-bancos/inicio-cards-bancos.component';
import { Component } from '@angular/core';
import { InicioCardsComponent } from "./cards-info/inicio-cards/inicio-cards.component";
import { InicioGraficoVentasComponent } from "./inicio-grafico-ventas/inicio-grafico-ventas.component";
import { CommonModule } from '@angular/common';
import { MatIconModule } from "@angular/material/icon";
import { InicioUltimasVentasComponent } from "./cards-info/inicio-ultimas-ventas/inicio-ultimas-ventas.component";
import { BajoStockComponent } from "./bajo-stock/bajo-stock.component";
import { InicioBajoStockComponent } from "./cards-info/inicio-bajo-stock/inicio-bajo-stock.component";

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [InicioCardsComponent, InicioGraficoVentasComponent,
    InicioCardsBancosComponent, CommonModule, MatIconModule, InicioUltimasVentasComponent, BajoStockComponent, InicioBajoStockComponent],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {
today = new Date();
}
