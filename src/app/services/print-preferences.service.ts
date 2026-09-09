import { Injectable } from '@angular/core';
export type FormatoImpresion = 'TICKET_58' | 'TICKET_80' | 'A4';
export type AccionImpresion = 'PREGUNTAR' | 'IMPRIMIR' | 'DESCARGAR';
export interface PreferenciasImpresion { formato: FormatoImpresion; accion: AccionImpresion; }
@Injectable({ providedIn: 'root' })
export class PrintPreferencesService {
  private readonly key = 'inventario-pixels.impresion.v2';
  get(): PreferenciasImpresion { try { const v = JSON.parse(localStorage.getItem(this.key) || '{}'); return { formato: ['TICKET_58','TICKET_80','A4'].includes(v.formato) ? v.formato : 'TICKET_80', accion: ['PREGUNTAR','IMPRIMIR','DESCARGAR'].includes(v.accion) ? v.accion : 'PREGUNTAR' } as PreferenciasImpresion; } catch { return { formato: 'TICKET_80', accion: 'PREGUNTAR' }; } }
  save(value: PreferenciasImpresion): void { localStorage.setItem(this.key, JSON.stringify(value)); }
}
