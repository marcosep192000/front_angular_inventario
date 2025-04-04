import { Component } from '@angular/core';
import { InicioCardsComponent } from "./cards-info/inicio-cards/inicio-cards.component";
import { InicioGraficoVentasComponent } from "./inicio-grafico-ventas/inicio-grafico-ventas.component";

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [InicioCardsComponent, InicioGraficoVentasComponent],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {

}
