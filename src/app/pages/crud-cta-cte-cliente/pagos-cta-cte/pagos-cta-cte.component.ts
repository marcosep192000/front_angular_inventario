import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { TicketCtaCtePendienteCliente } from '../../../interfaces/TicketCtaCtePendienteCliente';
import { CtaCteService } from '../../../services/cta-cte.service';
import { SelectionModel } from '@angular/cdk/collections';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { registrarDeudaCtaCteCliente } from '../../../interfaces/registrarDeudaCtaCteCliente';
@Component({
  selector: 'app-pagos-cta-cte',
  standalone: true,
  imports: [
    MatDatepickerModule,
    ToastrModule,
    MatInputModule,
    MatTableModule,
    CommonModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    FormsModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    MatCardModule,  
    MatCheckboxModule, FormsModule
  ],
  templateUrl: './pagos-cta-cte.component.html',
  styleUrl: './pagos-cta-cte.component.css'
})
export class PagosCtaCteComponent implements OnInit {
  displayedColumns: string[] = [ 'fecha','tipo', 'total' ];
  displayedColumnsWithSelect = ['select', ...this.displayedColumns];
  dataSource = new MatTableDataSource<TicketCtaCtePendienteCliente>();
  selection = new SelectionModel<TicketCtaCtePendienteCliente>(true, []);
 
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    public ctaCteService: CtaCteService, private toastr: ToastrService,
  ) {}
  
  ngOnInit(): void {
    this.mostrarTicketPendiente();
  }

  mostrarTicketPendiente() {
    this.ctaCteService.buscarticketsCtaCtePendienteCliente(this.data.idCliente).subscribe(data => {
      this.dataSource.data = data;
    });
  }

  toggleAllRows(event: any) {
    if (event.checked) {
      this.selection.select(...this.dataSource.data);
    } else {
      this.selection.clear();
    }
  }

  toggleRow(row: TicketCtaCtePendienteCliente) {
    this.selection.toggle(row);
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  getTotalSeleccionado(): number {
    return this.selection.selected.reduce((acc, curr) => acc + curr.total, 0);
  }

  realizarPagoEnCtaCte() {
    const ticketIds = this.selection.selected.map(t => t.id);
    const totalPagar = this.getTotalSeleccionado();
  
    const payload: registrarDeudaCtaCteCliente = {
      registrarDeudaCtaCte: totalPagar,
      ticketIds: ticketIds
    };
  
    this.ctaCteService.registrarPago(this.data.idCliente, payload).subscribe({
      next: () => {
        this.toastr.success('Pago registrado con éxito');
        this.dialog.closeAll();
      },
      error: (err) => {
        this.toastr.error('Error al registrar el pago');
        console.error(err);
      }
    });
  }

  
  cancel() {
    this.dialog.closeAll();
  }
}
