import { Component } from '@angular/core';
import { UltimaVenta } from '../../../../../../interfaces/UltimaVenta';
import { DashboardService } from '../../../../../../services/dashboard.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inicio-ultimas-ventas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio-ultimas-ventas.component.html',
  styleUrl: './inicio-ultimas-ventas.component.css'
})
export class InicioUltimasVentasComponent {
 ventas: UltimaVenta[] = [];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {

    this.dashboardService.getUltimasVentas().subscribe({

      next: data => this.ventas = data,

      error: err => console.error(err)

    });

  }

}
