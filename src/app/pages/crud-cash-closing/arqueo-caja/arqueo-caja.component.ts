import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { CajaService } from '../../../services/caja.service';
import { CajaArqueo } from '../../../interfaces/caja-arqueo';

import { ConfirmarCierreCajaComponent } from '../dialogs/confirmar-cierre-caja/confirmar-cierre-caja.component';

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
    MatCardModule,
  ],

  templateUrl: './arqueo-caja.component.html',
  styleUrls: ['./arqueo-caja.component.css'],
})
export class ArqueoCajaComponent implements OnInit {

  // =====================================================
  // ARQUEO
  // =====================================================

  arqueo?: CajaArqueo;


  // =====================================================
  // ARQUEO FÍSICO
  // =====================================================

  efectivoContado = 0;

  diferencia = 0;


  // =====================================================
  // RETIRO DE EFECTIVO
  // =====================================================

  deseaRetirarEfectivo = false;

  montoRetiro = 0;


  // =====================================================
  // COLUMNAS LIBRO DIARIO
  // =====================================================

  displayedColumns = [
    'fecha',
    'tipo',
    'categoria',
    'comprobante',
    'ingreso',
    'egreso',
    'saldo',
  ];


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    @Inject(MAT_DIALOG_DATA)
    public data: any,

    private cajaService: CajaService,

    private dialogRef: MatDialogRef<ArqueoCajaComponent>,

    private dialog: MatDialog,

  ) {}


  // =====================================================
  // INICIALIZACIÓN
  // =====================================================

  ngOnInit(): void {

    this.cargarArqueo();

  }


  // =====================================================
  // CARGAR ARQUEO
  // =====================================================

  private cargarArqueo(): void {

    this.cajaService
      .getArqueo(this.data.id)

      .subscribe({

        next: (resp) => {

          console.log(
            '========== ARQUEO DE CAJA =========='
          );

          console.log(resp);

          console.log(
            'Efectivo esperado:',
            resp.efectivoEsperado
          );

          console.log(
            'Saldo total:',
            resp.saldoEsperado
          );

          console.log(
            'Transferencias:',
            resp.transferencias
          );

          console.log(
            'Mercado Pago:',
            resp.mercadoPago
          );

          console.log(
            '===================================='
          );


          this.arqueo = resp;


          // -------------------------------------------------
          // Inicializamos el conteo en cero.
          // -------------------------------------------------

          this.efectivoContado = 0;

          this.diferencia = 0;


          // -------------------------------------------------
          // Inicializamos el retiro.
          // -------------------------------------------------

          this.deseaRetirarEfectivo = false;

          this.montoRetiro = 0;

        },

        error: (err) => {

          console.error(
            'Error obteniendo arqueo:',
            err
          );

        },

      });

  }


  // =====================================================
  // CALCULAR DIFERENCIA DE EFECTIVO
  // =====================================================

  calcularDiferencia(): void {

    if (!this.arqueo) {

      return;

    }


    /*
     * La diferencia se calcula ÚNICAMENTE
     * sobre el efectivo físico.
     *
     * NO usamos saldoEsperado.
     */

    this.diferencia =
      this.efectivoContado -
      this.arqueo.efectivoEsperado;


    console.log(
      '========== ARQUEO =========='
    );

    console.log(
      'Efectivo esperado:',
      this.arqueo.efectivoEsperado
    );

    console.log(
      'Efectivo contado:',
      this.efectivoContado
    );

    console.log(
      'Diferencia:',
      this.diferencia
    );

    console.log(
      '============================'
    );


    /*
     * Si disminuimos el efectivo contado,
     * también debemos verificar que el
     * retiro siga siendo válido.
     */

    this.validarMontoRetiro();

  }


  // =====================================================
  // VALIDAR MONTO RETIRO
  // =====================================================

  validarMontoRetiro(): void {

    /*
     * Si el usuario eligió NO retirar,
     * siempre debe quedar retiro = 0.
     */

    if (!this.deseaRetirarEfectivo) {

      this.montoRetiro = 0;

      return;

    }


    /*
     * Evitar null / undefined.
     */

    if (
      this.montoRetiro === null ||
      this.montoRetiro === undefined ||
      Number.isNaN(this.montoRetiro)
    ) {

      this.montoRetiro = 0;

    }


    /*
     * Nunca permitimos números negativos.
     */

    if (this.montoRetiro < 0) {

      this.montoRetiro = 0;

    }


    /*
     * Nunca se puede retirar más
     * efectivo del que realmente
     * se contó.
     */

    if (
      this.montoRetiro >
      this.efectivoContado
    ) {

      this.montoRetiro =
        this.efectivoContado;

    }

  }


  // =====================================================
  // RETIRO REAL
  // =====================================================

  get retiroCaja(): number {

    if (!this.deseaRetirarEfectivo) {

      return 0;

    }


    return Math.max(
      0,
      this.montoRetiro
    );

  }


  // =====================================================
  // EFECTIVO PARA PRÓXIMA CAJA
  // =====================================================

  get efectivoParaProximaCaja(): number {

    /*
     * Lo que queda físicamente después
     * del retiro.
     */

    return Math.max(
      0,
      this.efectivoContado -
      this.retiroCaja
    );

  }


  // =====================================================
  // CERRAR DIALOG
  // =====================================================

  cerrar(): void {

    this.dialogRef.close();

  }


  // =====================================================
  // CONFIRMAR CIERRE
  // =====================================================

  confirmarCierre(): void {

    if (!this.arqueo) {

      return;

    }


    // -------------------------------------------------
    // Validar primero el conteo
    // -------------------------------------------------

    if (this.efectivoContado < 0) {

      console.error(
        'El efectivo contado no puede ser negativo'
      );

      return;

    }


    // -------------------------------------------------
    // Validar retiro
    // -------------------------------------------------

    this.validarMontoRetiro();


    if (
      this.retiroCaja >
      this.efectivoContado
    ) {

      console.error(
        'No se puede retirar más efectivo del contado'
      );

      return;

    }


    /*
     * Antes de cerrar mostramos
     * el diálogo de confirmación.
     */

    const dialogRef = this.dialog.open(
      ConfirmarCierreCajaComponent,
      {
        width: '450px',
        maxWidth: '95vw',
        disableClose: true,
      },
    );


    dialogRef
      .afterClosed()

      .subscribe((confirmado: boolean) => {

        if (!confirmado) {

          return;

        }


        this.ejecutarCierre();

      });

  }


  // =====================================================
  // EJECUTAR CIERRE
  // =====================================================

  private ejecutarCierre(): void {

    if (!this.arqueo) {

      return;

    }


    // =================================================
    // VALIDACIONES
    // =================================================

    if (this.efectivoContado < 0) {

      console.error(
        'El efectivo contado no puede ser negativo'
      );

      return;

    }


    this.validarMontoRetiro();


    if (this.retiroCaja < 0) {

      console.error(
        'El retiro no puede ser negativo'
      );

      return;

    }


    if (
      this.retiroCaja >
      this.efectivoContado
    ) {

      console.error(
        'No se puede retirar más efectivo del contado'
      );

      return;

    }


    // =================================================
    // DATOS FINALES
    // =================================================

    const retiro =
      this.retiroCaja;


    const efectivoProximaCaja =
      this.efectivoParaProximaCaja;


    console.log(
      '========== DATOS CIERRE =========='
    );

    console.log(
      'Caja:',
      this.arqueo.cajaId
    );

    console.log(
      'Efectivo esperado:',
      this.arqueo.efectivoEsperado
    );

    console.log(
      'Efectivo contado:',
      this.efectivoContado
    );

    console.log(
      'Diferencia:',
      this.diferencia
    );

    console.log(
      'Desea retirar:',
      this.deseaRetirarEfectivo
    );

    console.log(
      'Retiro:',
      retiro
    );

    console.log(
      'Efectivo próxima caja:',
      efectivoProximaCaja
    );

    console.log(
      '=================================='
    );


    // =================================================
    // ENVIAR AL BACKEND
    // =================================================

    this.cajaService

      .closeCaja(
        this.arqueo.cajaId,
        this.efectivoContado,
        efectivoProximaCaja
      )

      .subscribe({

        next: () => {

          console.log(
            'Caja cerrada correctamente'
          );


          /*
           * Generamos el PDF utilizando
           * la caja que acabamos de cerrar.
           */

          this.exportarPdf();


          /*
           * Avisamos al componente padre.
           */

          this.dialogRef.close(true);

        },


        error: (err) => {

          console.error(
            'Error al cerrar caja:',
            err
          );

        },

      });

  }


  // =====================================================
  // EXPORTAR PDF
  // =====================================================

  exportarPdf(): void {

    if (!this.arqueo) {

      return;

    }


    this.cajaService

      .descargarPdf(this.arqueo.cajaId)

      .subscribe({

        next: (blob) => {

          const archivo =
            new Blob(
              [blob],
              {
                type: 'application/pdf',
              }
            );


          const url =
            window.URL.createObjectURL(
              archivo
            );


          const a =
            document.createElement('a');


          a.href = url;


          a.download =
            `ArqueoCaja_${this.arqueo?.cajaId}.pdf`;


          a.click();


          window.URL.revokeObjectURL(url);

        },


        error: (err) => {

          console.error(
            'Error descargando PDF:',
            err
          );

        },

      });

  }

}
