import { Component, Inject, Input, OnInit } from '@angular/core';
import { Client } from '../../../interfaces/Client';
import { ClientService } from '../../../services/client.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { FormProductComponent } from '../../crud-product/form-product/form-product.component';
import { MatCardModule } from '@angular/material/card';
@Component({
  selector: 'app-form-nueva-venta-cta-cte',
  standalone: true,
  imports: [    CommonModule,
      FormsModule,
      ReactiveFormsModule,
      MatButtonModule,
      MatFormFieldModule,
      MatIconModule,
      MatDialogModule,
      MatInputModule,
      MatTooltipModule,
      ToastrModule,MatCardModule],
  templateUrl: './form-nueva-venta-cta-cte.component.html',
  styleUrl: './form-nueva-venta-cta-cte.component.css'
})
export class FormNuevaVentaCtaCteComponent implements OnInit {
cliente!:Client ;
@Input() datoIdCliente!:any;
constructor(private clientService:ClientService,
  @Inject(MAT_DIALOG_DATA) public data:any,
  public dialogRef: MatDialogRef<FormNuevaVentaCtaCteComponent>,
  public dialog: MatDialog,
  private fb: FormBuilder,
  private toastr: ToastrService,
){

} 
  ngOnInit(): void {
    this.consultarCliente(this.datoIdCliente);
  }

consultarCliente(id: Client){
  this.clientService.obtenerClientePorId(this.datoIdCliente).subscribe((data) =>{
 this.cliente = data })
}

}
