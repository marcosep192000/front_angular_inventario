import { Component, OnDestroy, OnInit } from '@angular/core';
import { DashboardService } from '../../../../../../services/dashboard.service';
import { Subscription } from 'rxjs';
import { dashboardInfoGeneral, dataDashboard } from '../../../../../../interfaces/dashboard';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-inicio-cards',
  standalone: true,
  imports: [CommonModule,
      MatTableModule,
      MatPaginatorModule,
      MatButtonModule,
      FormsModule,
      MatFormFieldModule,
      MatIconModule,
      MatDialogModule,
      MatFormFieldModule,
      MatButtonModule,
      MatDialogModule,RouterLink,
      MatInputModule,
      MatTooltipModule],
  templateUrl: './inicio-cards.component.html',
  styleUrl: './inicio-cards.component.css',
})
export class InicioCardsComponent implements OnInit, OnDestroy {
  data_cards: dataDashboard | undefined;
  data_general: dashboardInfoGeneral | undefined;
  private subscription: Subscription = new Subscription();
  constructor(private dashboardService: DashboardService) {}
  ngOnInit(): void {
    this.getProductosMasVendidos();
    this.getDashboardInfoGeneral();
  }
  getProductosMasVendidos(): void {
    this.subscription = this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.data_cards= data;
        console.log(this.data_cards);
      },
      error: (err) =>
        console.error('Error al obtener los datos del dashboard', err),
    });
  }

  getDashboardInfoGeneral(): void {
    this.subscription = this.dashboardService.getDashboardInfoGeneral().subscribe({
      next: (data) => {

        this.data_general = data;
          console.log('Datos del dashboard general:', this.data_general);
      },
      error: (err) =>
        console.error('Error al obtener los datos del dashboard general', err),
    });
  }




  ngOnDestroy(): void {
    this.subscription.unsubscribe(); // Evita memory leaks
  }



}
