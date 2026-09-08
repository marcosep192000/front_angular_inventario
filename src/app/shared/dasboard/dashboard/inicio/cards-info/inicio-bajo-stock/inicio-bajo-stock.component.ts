import { RouterLink } from '@angular/router';
import { stockStatus } from '../../../../../../pages/crud-product/list-product/product-stock.utils';
import { Component } from '@angular/core';
import { DashboardService } from '../../../../../../services/dashboard.service';
import { LowStockProduct } from '../../../../../../interfaces/producto-bajo-stock';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inicio-bajo-stock',
  standalone: true,
  imports: [ CommonModule, RouterLink,
    MatButtonModule],
  templateUrl: './inicio-bajo-stock.component.html',
  styleUrl: './inicio-bajo-stock.component.css'
})
export class InicioBajoStockComponent {
    readonly stockStatus = stockStatus;
    productos:LowStockProduct[]=[];

    constructor(private dashboardService:DashboardService){}

    ngOnInit(){

        this.dashboardService.getProductosBajoStock().subscribe({

            next:(resp)=>{

                this.productos =resp;

            }

        });

    }
}
