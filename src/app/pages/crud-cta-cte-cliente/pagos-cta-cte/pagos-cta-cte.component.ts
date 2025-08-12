import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { MatTabsModule } from '@angular/material/tabs';
import { log } from 'node:console';
@Component({
  selector: 'app-pagos-cta-cte',
  standalone: true,
  imports: [
    MatTabsModule,
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
saldoCtaCte: number = 0; // cargalo desde backend
 tabsDisabled = {
  pagarFactura: false
};

  displayedColumns: string[] = [ 'fecha','tipo', 'total' ];
  displayedColumnsWithSelect = ['select', ...this.displayedColumns];
  dataSource = new MatTableDataSource<TicketCtaCtePendienteCliente>();
  selection = new SelectionModel<TicketCtaCtePendienteCliente>(true, []);
 pagoForm!: FormGroup;
  resultadoPago: any[] = [];
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    public ctaCteService: CtaCteService, private toastr: ToastrService,
     private fb: FormBuilder,
  ) {}
  
  ngOnInit(): void {
    this.mostrarTicketPendiente();  this.saldoCtaCte = this.data.saldoCtaCte;

       this.pagoForm = this.fb.group({
      monto: [null, [Validators.required, Validators.min(1)]]
    });
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


 realizarPago() {
  const clienteId = this.data.idCliente;
  const monto = this.pagoForm.value.monto;
  console.error(monto + " este es el monto despues del realizar pago")
  if (monto > this.saldoCtaCte) {
    this.toastr.warning('El monto ingresado supera el saldo de la cuenta corriente');
    console.log("el salido es mayor");
    return;
  }

  this.ctaCteService.pagarMontoParcial(clienteId, monto).subscribe({
    next: (response: any) => {
      this.resultadoPago = response;
      this.tabsDisabled.pagarFactura = true; // ⚠️ bloquear otra pestaña
    },
    error: (err) => {
      console.error('Error al realizar el pago', err);
      this.toastr.error('Hubo un error al registrar el pago');
    }
  });
}

cancelarPago() {
  this.pagoForm.reset();
  this.resultadoPago = [];
  this.tabsDisabled.pagarFactura = false; // desbloquear
}
}

