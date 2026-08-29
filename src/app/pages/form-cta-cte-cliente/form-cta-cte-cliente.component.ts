import { Component, Inject, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {  MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';

import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { ClientService } from '../../services/client.service';
import { Client } from '../../interfaces/Client';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { PagosCtaCteComponent } from '../crud-cta-cte-cliente/pagos-cta-cte/pagos-cta-cte.component';
import { CtaCteService } from '../../services/cta-cte.service';
import { HistorialCuentaCorriente } from '../../interfaces/historial-cuenta-corriente';


@Component({
  selector: 'app-form-cta-cte-cliente',
  standalone: true,
  imports: [MatDatepickerModule,
    ToastrModule,
    MatInputModule,
    CommonModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    FormsModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatSlideToggleModule,MatCardModule],
  templateUrl: './form-cta-cte-cliente.component.html',
  styleUrl: './form-cta-cte-cliente.component.css'
})
export class FormCtaCteClienteComponent implements  OnInit {

 
  constructor(private clientService: ClientService,
    public dialogRef: MatDialogRef<FormCtaCteClienteComponent>,
   @Inject(MAT_DIALOG_DATA) public data : any, public dialog: MatDialog,
   private ctaCteService: CtaCteService,
   private toastr: ToastrService,
  ){}
cliente!:Client; 
deudaPendiente: number | null = null;
mostrarEdicionLimite = false;
nuevoLimite: number | null = null;
guardandoLimite = false;
mostrarHistorial = false;
historialCuenta: HistorialCuentaCorriente | null = null;
cargandoHistorial = false;
idCliente : any = this.data.updateClient; 
buscarClientePorId(idCliente :number){
this.clientService.obtenerClientePorId(idCliente).subscribe(dataCliente => {
  this.cliente = dataCliente ; 
})
}

  refrescarCuenta(): void {
    this.historialCuenta = null;
    this.buscarClientePorId(this.idCliente);
    this.cargarDeudaPendiente();
  }


  ngOnInit(): void {
 this.buscarClientePorId(this.idCliente);
 this.cargarDeudaPendiente();
  }

  cargarDeudaPendiente(): void {
    this.ctaCteService.obtenerFacturasPendientes(this.idCliente).subscribe({
      next: (facturas) => {
        this.deudaPendiente = facturas.reduce(
          (total, factura) => total + Number(factura.saldoPendiente || 0),
          0,
        );
      },
      error: () => this.deudaPendiente = null,
    });
  }

  get deudaActual(): number {
    return this.deudaPendiente ?? Math.max(0, this.limiteCredito - Number(this.cliente?.cuentaCorriente?.saldo || 0));
  }

  get limiteCredito(): number {
    return Number(this.cliente?.cuentaCorriente?.montoMaximoDeCtaCte || 0);
  }

  get creditoDisponible(): number {
    return Math.max(0, this.limiteCredito - this.deudaActual);
  }

  abrirEdicionLimite(): void {
    this.nuevoLimite = this.limiteCredito;
    this.mostrarEdicionLimite = true;
  }

  guardarNuevoLimite(): void {
    const nuevoLimite = Number(this.nuevoLimite);
    if (!Number.isFinite(nuevoLimite) || nuevoLimite <= this.limiteCredito) {
      this.toastr.warning('El nuevo límite debe ser mayor al límite actual.');
      return;
    }

    this.guardandoLimite = true;
    this.clientService.actualizarLimiteCuentaCorriente(this.idCliente, nuevoLimite).subscribe({
      next: (respuesta) => {
        if (this.cliente.cuentaCorriente) {
          this.cliente.cuentaCorriente.montoMaximoDeCtaCte = respuesta.limite;
          this.cliente.cuentaCorriente.saldo = respuesta.saldoDisponible;
        }
        this.deudaPendiente = respuesta.deudaActual;
        this.guardandoLimite = false;
        this.mostrarEdicionLimite = false;
        this.historialCuenta = null;
        this.toastr.success('Límite de crédito actualizado correctamente.');
      },
      error: (error) => {
        this.guardandoLimite = false;
        this.toastr.error(error?.error?.error || 'No se pudo actualizar el límite de crédito.');
      },
    });
  }

  verHistorialCuenta(): void {
    this.mostrarHistorial = !this.mostrarHistorial;
    if (!this.mostrarHistorial || this.historialCuenta) return;
    this.cargandoHistorial = true;
    this.ctaCteService.obtenerHistorialCuenta(this.idCliente).subscribe({
      next: (historial) => { this.historialCuenta = historial; this.cargandoHistorial = false; },
      error: () => { this.cargandoHistorial = false; this.toastr.error('No se pudo cargar el estado de cuenta.'); },
    });
  }

  descargarEstadoCuenta(): void {
    this.ctaCteService.descargarHistorialPdf(this.idCliente).subscribe({
      next: (archivo) => this.descargarArchivo(archivo, `estado-cuenta-cliente-${this.idCliente}.pdf`),
      error: () => this.toastr.error('No se pudo descargar el estado de cuenta.'),
    });
  }

  private descargarArchivo(archivo: Blob, nombre: string): void {
    const url = URL.createObjectURL(archivo);
    const enlace = document.createElement('a');
    enlace.href = url; enlace.download = nombre; enlace.click();
    URL.revokeObjectURL(url);
  }




cancel() {
this.dialogRef.close(); 
}

//dialig form para mostrar las facturas pendiantes y realizar el pago en cuenta corriente 
realizarPagoEnCtaCte(idCliente: number) {
  const dialogRef = this.dialog.open(PagosCtaCteComponent,{
    disableClose: true,
    autoFocus: true,
    hasBackdrop: true,
    closeOnNavigation: false,
    data: {
      tipo: 'createClient',
      idCliente:idCliente, 
    },
  });
  dialogRef.afterClosed().subscribe((cobroRegistrado) => {
    if (cobroRegistrado) {
      this.refrescarCuenta();
    }
  });
}



}


