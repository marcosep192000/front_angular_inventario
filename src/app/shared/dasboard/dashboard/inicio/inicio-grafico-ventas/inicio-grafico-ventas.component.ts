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
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';


Chart.register(...registerables);

@Component({
  selector: 'app-inicio-grafico-ventas',
  standalone: true,
  imports: [NgChartsModule, CommonModule],
  templateUrl: './inicio-grafico-ventas.component.html',
  styleUrl: './inicio-grafico-ventas.component.css',
})
export class InicioGraficoVentasComponent {
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
    this.dashboardService.getVentasPorDia().subscribe((data) => {
      console.log('Datos recibidos:', data); // 🛠️ Verificar la estructura

      const labelsSet = new Set<string>();
      const datasetsMap: {
        [anio: number]: {
          label: string;
          data: number[];
          backgroundColor: string;
        };
      } = {};

      data.forEach((v) => {
        // ✅ Usa solo el día si `mes` no existe
        const label = v.mes ? `${v.dia}/${v.mes}` : `${v.dia}`;
        labelsSet.add(label);

        if (!datasetsMap[v.anio]) {
          datasetsMap[v.anio] = {
            label: `Año ${v.anio}`,
            data: [],
            backgroundColor:
              v.anio === new Date().getFullYear()
                ? 'rgba(75, 192, 192, 0.5)'
                : 'rgba(255, 99, 132, 0.5)',
          };
        }

        datasetsMap[v.anio].data.push(v.ventas);
      });

      this.barChartData = {
        labels: Array.from(labelsSet),
        datasets: Object.values(datasetsMap),
      };

      console.log('Etiquetas:', this.barChartData.labels); // 🛠️ Verificar etiquetas
      console.log('Datos del gráfico:', this.barChartData.datasets);
    });
  }



}
