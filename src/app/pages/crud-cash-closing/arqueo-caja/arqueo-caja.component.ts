import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { CajaService } from '../../../services/caja.service';
import { CajaArqueo } from '../../../interfaces/caja-arqueo';
import { MatIconModule } from "@angular/material/icon";
import { MatCardModule } from "@angular/material/card";

@Component({
  selector: 'app-arqueo-caja',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatCardModule
],
  templateUrl: './arqueo-caja.component.html',
  styleUrls: ['./arqueo-caja.component.css']
})
export class ArqueoCajaComponent implements OnInit {

  arqueo?: CajaArqueo;

  efectivoContado = 0;

  diferencia = 0;

  displayedColumns = [
    'fecha',
    'tipo',
    'categoria',
    'comprobante',
    'ingreso',
    'egreso',
    'saldo'
  ];

  constructor(

    @Inject(MAT_DIALOG_DATA)
    public data: any,

    private cajaService: CajaService,

    private dialogRef: MatDialogRef<ArqueoCajaComponent>

  ) {}

  ngOnInit(): void {

    this.cajaService.getArqueo(this.data.id)
      .subscribe({

        next: resp => {

          this.arqueo = resp;

        },

        error: err => console.error(err)

      });

  }

  calcularDiferencia(): void {

    if (!this.arqueo) {
      return;
    }

    this.diferencia =
      this.efectivoContado -
      this.arqueo.saldoEsperado;

  }

  cerrar(): void {

    this.dialogRef.close();

  }
  confirmarCierre(): void {

    if (!this.arqueo) {
        return;
    }

    this.cajaService.closeCaja(
        this.arqueo.cajaId,
        this.efectivoContado
    ).subscribe({

        next: () => {

            this.dialogRef.close(true);

        },

        error: err => console.error(err)

    });

}


// PDFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
exportarPdf(): void {

  if (!this.arqueo) {
    return;
  }

  this.cajaService
    .descargarPdf(this.arqueo.cajaId)
    .subscribe({

      next: (blob) => {

        const archivo = new Blob(
          [blob],
          { type: 'application/pdf' }
        );

        const url = window.URL.createObjectURL(archivo);

        const a = document.createElement('a');

        a.href = url;

        a.download = `ArqueoCaja_${this.arqueo?.cajaId}.pdf`;

        a.click();

        window.URL.revokeObjectURL(url);

      },

      error: (err) => {

        console.error(err);

      }

    });

}

}
