import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { ResumenReporte } from '../../../../../../../modules/reportes/interfaces/reportes';
import { ReportesService } from '../../../../../../../modules/reportes/services/reportes.service';

@Component({
  selector: 'app-inicio-cards-bancos',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './inicio-cards-bancos.component.html',
  styleUrl: './inicio-cards-bancos.component.css'
})
export class InicioCardsBancosComponent implements OnInit {
  productos: ResumenReporte[] = [];
  cargando = true;

  constructor(
    private readonly reportesService: ReportesService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.reportesService
      .getRankingProductos({ tipoRanking: 'MAS_VENDIDOS', limit: 10 })
      .subscribe({
        next: (respuesta) => {
          this.productos = Array.isArray(respuesta) ? respuesta.slice(0, 10) : [];
          this.cargando = false;
        },
        error: () => {
          this.productos = [];
          this.cargando = false;
        },
      });
  }

  abrirRanking(): void {
    this.router.navigate(['/dashboard/reportes/ventas/ranking']);
  }

  nombre(producto: ResumenReporte): string {
    return String(producto['nombre'] ?? producto['name'] ?? 'Producto sin nombre');
  }

  cantidad(producto: ResumenReporte): number {
    return Number(producto['cantidadVendida'] ?? producto['cantidad'] ?? 0);
  }

  estrellas(posicion: number): string {
    return '★'.repeat(Math.max(1, 5 - Math.floor(posicion / 2)));
  }

}
