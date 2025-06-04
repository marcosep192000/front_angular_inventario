
import { Component, OnDestroy, OnInit } from '@angular/core';
import { DashboardService } from '../../../../../../services/dashboard.service';
import { error } from 'console';
import { Subscription } from 'rxjs';
import { dataDashboard } from '../../../../../../interfaces/dashboard';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-inicio-cards',
  standalone: true,
  imports: [CommonModule],
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

  

  ngOnDestroy(): void {
    this.subscription.unsubscribe(); // Evita memory leaks
  }
}