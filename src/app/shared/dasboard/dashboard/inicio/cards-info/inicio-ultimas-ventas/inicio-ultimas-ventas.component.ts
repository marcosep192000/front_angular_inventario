import { Component } from '@angular/core';
import { UltimaVenta } from '../../../../../../interfaces/UltimaVenta';
import { DashboardService } from '../../../../../../services/dashboard.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-inicio-ultimas-ventas',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule],
  templateUrl: './inicio-ultimas-ventas.component.html',
  styleUrl: './inicio-ultimas-ventas.component.css'
})
export class InicioUltimasVentasComponent {
 ventas: UltimaVenta[] = [];
 loading = true;
 error = false;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {

    this.dashboardService.getUltimasVentas().subscribe({

      next: data => { this.ventas = data; this.loading = false; },
      error: () => { this.loading = false; this.error = true; }

    });

  }

}
