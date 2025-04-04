import { Component, inject, Inject } from '@angular/core';
import { SpinnerService } from '../../services/spinner.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AppComponent } from '../../app.component';
import { ApiDolarComponent } from '../api-dolar/api-dolar.component';
import { CardsIndexComponent } from '../dasboard/cards-index/cards-index.component';
import { FastAccesComponent } from '../dasboard/fastAcces/fast-acces/fast-acces.component';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [MatGridListModule,
      MatMenuModule,
      MatIconModule,
      MatButtonModule,
      MatCardModule,
   
      MatProgressSpinnerModule,
     

      SpinnerComponent],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.css'
})
export class SpinnerComponent {
  private readonly spinner = inject(SpinnerService);
  isLoading = this.spinner.isLoading;
}
