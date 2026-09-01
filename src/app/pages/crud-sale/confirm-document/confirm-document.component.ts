import { Component, Inject } from '@angular/core';

import { CommonModule } from '@angular/common';


import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDocumentData {
  tipoDocumento: string;
  nombreDocumento: string;
  cliente: string;
  cantidadProductos: number;
  total: number;
  mensaje: string;
  whatsappDisponible?: boolean;
  motivoWhatsappNoDisponible?: string;
  whatsappUrl?: string;
}

export type ConfirmDocumentAction = 'pdf' | 'whatsapp';

@Component({
  selector: 'app-confirm-document',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './confirm-document.component.html',
  styleUrl: './confirm-document.component.css'
})
export class ConfirmDocumentComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: ConfirmDocumentData,

    private dialogRef:
      MatDialogRef<ConfirmDocumentComponent>
  ) {}

  cancelar(): void {

    this.dialogRef.close(null);

  }

  confirmar(): void {

    this.dialogRef.close('pdf');

  }

  enviarWhatsapp(): void {
    if (this.data.whatsappUrl) {
      window.open(this.data.whatsappUrl, '_blank');
    }
    this.dialogRef.close('whatsapp');
  }
obtenerIcono(): string {

  switch (this.data.tipoDocumento) {

    case 'PRESUPUESTO':
      return 'request_quote';

    case 'REMITO':
      return 'local_shipping';

    case 'NOTA_CREDITO_A':
    case 'NOTA_CREDITO_B':
    case 'NOTA_CREDITO_C':
      return 'assignment_return';

    case 'NOTA_DEBITO_A':
    case 'NOTA_DEBITO_B':
    case 'NOTA_DEBITO_C':
      return 'request_quote';

    default:
      return 'description';
  }

}
}
