import { Component } from '@angular/core';
import { DashboardService } from '../../../../../../services/dashboard.service';
import { LowStockByProvider } from '../../../../../../interfaces/producto-bajo-stock';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inicio-bajo-stock',
  standalone: true,
  imports: [ CommonModule,
    MatButtonModule],
  templateUrl: './inicio-bajo-stock.component.html',
  styleUrl: './inicio-bajo-stock.component.css'
})
export class InicioBajoStockComponent {
    productos:LowStockByProvider[]=[];

    constructor(private dashboardService:DashboardService){}

    ngOnInit(){

        this.dashboardService.getProductosBajoStock().subscribe({

            next:(resp)=>{

                this.productos =resp;

            }

        });

    }
}
