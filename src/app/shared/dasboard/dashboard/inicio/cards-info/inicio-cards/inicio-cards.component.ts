import { Component, OnDestroy, OnInit } from '@angular/core';
import { DashboardService } from '../../../../../../services/dashboard.service';
import { Subscription } from 'rxjs';
import { dataDashboard } from '../../../../../../interfaces/dashboard';
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
      MatDialogModule,
      MatInputModule,
      MatTooltipModule],
  templateUrl: './inicio-cards.component.html',
  styleUrl: './inicio-cards.component.css',
})
export class InicioCardsComponent implements OnInit, OnDestroy {
  data_cards: dataDashboard | undefined;
  private subscription: Subscription = new Subscription();
  constructor(private dashboardService: DashboardService) {}
  ngOnInit(): void {
    this.getProductosMasVendidos();
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

  getProductosBajoStock(){

  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe(); // Evita memory leaks
  }
}