import { Component, Inject, InjectionToken, Input, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {  MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';

import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ToastrModule } from 'ngx-toastr';

import { ClientService } from '../../services/client.service';
import { Client } from '../../interfaces/Client';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { dataDashboard } from '../../interfaces/dashboard';
import { IconComponent } from "../../shared/dasboard/icon/icon.component";
import { MatCardModule } from '@angular/material/card';


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
   @Inject(MAT_DIALOG_DATA) public data : any
  ){}
cliente!:Client; 
idCliente : any = this.data.updateClient; 
buscarClientePorId(idCliente :number){
this.clientService.getClientById(idCliente).subscribe(dataCliente => {
  this.cliente = dataCliente ; 
  console.log( " este es el cluebte datos "+this.cliente)
  
})
}


  ngOnInit(): void {
 this.buscarClientePorId(this.idCliente);
  }




cancel() {
this.dialogRef.close(); 
}

//dialig form para mostrar las facturas pendiantes y realizar el pago en cuenta corriente 
realizarPagoEnCtaCte() {
  
  }



}


