import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  MatFormFieldModule
} from '@angular/material/form-field';

import {
  MatInputModule
} from '@angular/material/input';

import {
  MatSelectModule
} from '@angular/material/select';

import {
  MatIconModule
} from '@angular/material/icon';


export interface ImpuestoFacturaProveedor {

  tipo: string;

  descripcion: string | null;

  porcentaje: number;

  baseImponible: number;

  importe: number;
}


@Component({
  selector: 'app-impuestos-factura',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],

  templateUrl:
    './impuestos-factura.component.html',

  styleUrl:
    './impuestos-factura.component.css'
})
export class ImpuestosFacturaComponent
  implements OnChanges {


  // =========================================================
  // BASE IMPONIBLE
  // =========================================================

  @Input()
  baseImponible = 0;


  // =========================================================
  // EVENTO
  // =========================================================

  @Output()
  impuestosChange =
    new EventEmitter<ImpuestoFacturaProveedor[]>();


  // =========================================================
  // LISTA
  // =========================================================

  impuestos:
    ImpuestoFacturaProveedor[] = [];


  // =========================================================
  // NUEVO IMPUESTO
  // =========================================================

  nuevoTipo = '';

  nuevoDescripcion = '';

  nuevoPorcentaje: number | null = null;


  // =========================================================
  // TIPOS
  // =========================================================

  tiposImpuesto = [

    {
      value: 'INGRESOS_BRUTOS',
      label: 'Ingresos Brutos'
    },

    {
      value: 'PERCEPCION_IVA',
      label: 'Percepción IVA'
    },

    {
      value: 'PERCEPCION_INGRESOS_BRUTOS',
      label: 'Percepción Ingresos Brutos'
    },

    {
      value: 'RETENCION',
      label: 'Retención'
    },

    {
      value: 'OTRO',
      label: 'Otro'
    }

  ];


  // =========================================================
  // CAMBIOS
  // =========================================================

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (
      changes['baseImponible']
    ) {

      this.recalcularTodos();

    }

  }


  // =========================================================
  // AGREGAR
  // =========================================================

  agregarImpuesto(): void {

    const porcentaje =
      Number(
        this.nuevoPorcentaje
      );


    if (!this.nuevoTipo) {

      return;

    }


    if (
      !Number.isFinite(porcentaje)
      ||
      porcentaje <= 0
    ) {

      return;

    }


    if (porcentaje > 100) {

      return;

    }


    const importe =
      this.calcularImporte(
        this.baseImponible,
        porcentaje
      );


    const impuesto:
      ImpuestoFacturaProveedor = {

        tipo:
          this.nuevoTipo,

        descripcion:
          this.nuevoDescripcion?.trim()
            || this.obtenerDescripcion(
                 this.nuevoTipo
               ),

        porcentaje,

        baseImponible:
          this.redondear(
            this.baseImponible
          ),

        importe

      };


    this.impuestos = [

      ...this.impuestos,

      impuesto

    ];


    this.limpiarFormulario();

    this.emitir();

  }


  // =========================================================
  // ELIMINAR
  // =========================================================

  eliminarImpuesto(
    index: number
  ): void {

    this.impuestos =
      this.impuestos.filter(
        (
          _,
          i
        ) => i !== index
      );


    this.emitir();

  }


  // =========================================================
  // RECALCULAR
  // =========================================================

  private recalcularTodos(): void {

    this.impuestos =
      this.impuestos.map(
        impuesto => ({

          ...impuesto,

          baseImponible:
            this.redondear(
              this.baseImponible
            ),

          importe:
            this.calcularImporte(
              this.baseImponible,
              impuesto.porcentaje
            )

        })
      );


    this.emitir();

  }


  // =========================================================
  // CALCULAR IMPORTE
  // =========================================================

  private calcularImporte(
    base: number,
    porcentaje: number
  ): number {

    return this.redondear(
      (
        Number(base) *
        Number(porcentaje)
      ) / 100
    );

  }


  // =========================================================
  // TOTAL IMPUESTOS
  // =========================================================

  get totalImpuestos(): number {

    return this.impuestos.reduce(
      (
        total,
        impuesto
      ) => {

        return total +
          (
            Number(
              impuesto.importe
            ) || 0
          );

      },

      0
    );

  }


  // =========================================================
  // DESCRIPCIÓN
  // =========================================================

  private obtenerDescripcion(
    tipo: string
  ): string {

    const encontrado =
      this.tiposImpuesto.find(
        item =>
          item.value === tipo
      );


    return encontrado?.label
      ?? 'Otro impuesto';

  }


  // =========================================================
  // LIMPIAR
  // =========================================================

  private limpiarFormulario(): void {

    this.nuevoTipo = '';

    this.nuevoDescripcion = '';

    this.nuevoPorcentaje = null;

  }


  // =========================================================
  // EMITIR
  // =========================================================

  private emitir(): void {

    this.impuestosChange.emit(
      [...this.impuestos]
    );

  }


  // =========================================================
  // RESET
  // =========================================================

  reset(): void {

    this.impuestos = [];

    this.limpiarFormulario();

    this.emitir();

  }


  // =========================================================
  // REDONDEAR
  // =========================================================

  private redondear(
    valor: number
  ): number {

    return Math.round(
      (
        Number(valor) + Number.EPSILON
      ) * 100
    ) / 100;

  }

}
