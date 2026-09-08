import { VentasPorDia } from './../../../../../interfaces/VentasPorDia';
import { Component } from '@angular/core';
import { DashboardService } from '../../../../../services/dashboard.service';
import {
  Chart,
  ChartData,
  ChartDataset,
  ChartOptions,
  ChartType,
  registerables,
} from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';


Chart.register(...registerables);

@Component({
  selector: 'app-inicio-grafico-ventas',
  standalone: true,
  imports: [NgChartsModule, CommonModule, MatIconModule],
  templateUrl: './inicio-grafico-ventas.component.html',
  styleUrl: './inicio-grafico-ventas.component.css',
})
export class InicioGraficoVentasComponent {
  loading = true;
  error = false;
  public barChartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top'
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: '#ececec'
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
};

  public barChartLabels: string[] = [];
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [],
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getVentasPorDia().subscribe({ next: (data) => {

      const rows = data ?? [];
      const labels = [...new Set(rows.map(v => `${v.dia}/${v.mes}`))]
        .sort((a, b) => Number(a.split('/')[0]) - Number(b.split('/')[0]));
      const years = [...new Set(rows.map(v => v.anio))].sort();

      this.barChartData = {
        labels,
        datasets: years.map(anio => ({
          label: `Año ${anio}`,
          data: labels.map(label => rows.find(v => v.anio === anio && `${v.dia}/${v.mes}` === label)?.ventas ?? 0),
          backgroundColor: anio === new Date().getFullYear()
            ? 'rgba(75, 192, 192, 0.5)'
            : 'rgba(255, 99, 132, 0.5)',
        })),
      };

      this.loading = false;
    }, error: () => { this.loading = false; this.error = true; } });
  }



}
