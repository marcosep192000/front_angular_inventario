import { Component, OnInit, ViewChild } from '@angular/core';
import { ClientService } from '../../../services/client.service';
import { Client } from '../../../interfaces/Client';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltip, MatTooltipModule, TooltipPosition } from '@angular/material/tooltip';
import { FormClientComponent } from '../form-client/form-client.component';
import { IconComponent } from "../../../shared/dasboard/icon/icon.component";
import { DialogGenericComponent } from '../../../shared/genericsComponents/dialog-generic/dialog-generic.component';
import { CrudCtaCteClienteComponent } from '../../crud-cta-cte-cliente/crud-cta-cte-cliente.component';
import { FormCtaCteClienteComponent } from '../../form-cta-cte-cliente/form-cta-cte-cliente.component';
import { CtaCteService } from '../../../services/cta-cte.service';
import { AlertaCuentaCorriente } from '../../../interfaces/historial-cuenta-corriente';
import { LicenseService } from '../../../services/license.service';

@Component({
  selector: 'app-list-client',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    FormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    MatTooltipModule,
    IconComponent
],
  templateUrl: './list-client.component.html',
  styleUrl: './list-client.component.css',
})
export class ListClientComponent implements OnInit {
  clients: Client[] = [];
  Form!: FormGroup;
  serch: string = '';
  positionOptions: TooltipPosition[] = ['below', 'above', 'left', 'right'];
  position = new FormControl(this.positionOptions[0]);
  displayedColumns: string[] = [
    'id',
    'dni',
    'name',
    'lastName',
    'address',
    'tel',
    'email',
    'Opciones',
  ];
  dataSource = new MatTableDataSource<Client>(this.clients);
  alertas: AlertaCuentaCorriente[] = [];
  mostrarAlertas = false;
  constructor(public clientService: ClientService, public dialog: MatDialog, private ctaCteService: CtaCteService, public license: LicenseService) {}
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator; // Añadimos el paginador al datasource
  }
  
  ngOnInit(): void {
    this.getClients();
    this.cargarAlertas();
  }
  cargarAlertas(): void {
    this.ctaCteService.obtenerAlertas().subscribe({ next: (alertas) => this.alertas = alertas, error: () => this.alertas = [] });
  }
  descargarReporteAlertas(): void {
    this.ctaCteService.descargarAlertasPdf().subscribe((archivo) => {
      const url = URL.createObjectURL(archivo); const enlace = document.createElement('a');
      enlace.href = url; enlace.download = 'reporte-cuentas-vencidas.pdf'; enlace.click(); URL.revokeObjectURL(url);
    });
  }
  aplicarMora(alerta: AlertaCuentaCorriente): void {
    const valor = window.prompt(`Aplicar mora a ${alerta.comprobante}. Ingresá el porcentaje (0,01 a 100):`, '10');
    if (valor === null) return;
    const porcentaje = Number(valor.replace(',', '.'));
    if (!Number.isFinite(porcentaje) || porcentaje < 0.01 || porcentaje > 100) {
      window.alert('El porcentaje debe estar entre 0,01 y 100.');
      return;
    }
    this.ctaCteService.obtenerHistorialCuenta(alerta.clienteId).subscribe({
      next: (historial) => {
        const yaTieneMora = historial.movimientos.some((movimiento) =>
          movimiento.tipo === 'MORA' && movimiento.comprobante === alerta.comprobante
        );
        const advertencia = yaTieneMora
          ? `Esta factura ya tiene una mora registrada. Se agregará otro recargo del ${porcentaje}% sobre el saldo pendiente actual.`
          : `Se incrementará la deuda de ${alerta.cliente} aplicando una mora del ${porcentaje}% sobre ${alerta.comprobante}.`;
        this.dialog.open(DialogGenericComponent, {
          disableClose: true,
          data: {
            component: 'aplicarMora',
            data: yaTieneMora ? 'Atención: factura con mora previa' : 'Confirmar aplicación de mora',
            state: 'Aplicar mora',
            icon: 'warning',
            message: `${advertencia} Esta acción aumenta la deuda.`,
          },
        }).afterClosed().subscribe((confirmado) => {
          if (!confirmado) return;
          this.ctaCteService.aplicarMora(alerta.clienteId, alerta.facturaId, porcentaje).subscribe({
            next: () => this.refrescarModulo(),
            error: (error) => window.alert(error?.error?.error || 'No se pudo aplicar la mora.'),
          });
        });
      },
      error: () => window.alert('No se pudo verificar el historial de la factura antes de aplicar la mora.'),
    });
  }
  getClients(): void {
    this.clientService.getClients().subscribe((client) => {
      const filteredProducts = client.filter(
        (client) => client.status.valueOf() === false
      );
      this.dataSource.data = filteredProducts;
    });
  }
  refrescarModulo(): void {
    this.getClients();
    this.cargarAlertas();
  }
  /* filtros para la busqueda */
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  createClient() {
    if (this.limiteClientesAlcanzado) { window.alert('Alcanzaste el límite de clientes permitido por tu plan.'); return; }
    const dialogRef = this.dialog.open(FormClientComponent, {
      disableClose: true,
      autoFocus: true,
      hasBackdrop: true,
      closeOnNavigation: false,
      data: {
        tipo: 'createClient',
      },
    });
    dialogRef.afterClosed().subscribe(() => {
      this.refrescarModulo();
    });
  }
  get limiteClientesAlcanzado(): boolean { const s=this.license.snapshot; return Boolean(s && s.maxClients !== -1 && s.currentClients >= s.maxClients); }
  get resumenLicenciaClientes(): string { const s=this.license.snapshot; return !s ? '' : `Clientes: ${s.currentClients} / ${s.maxClients === -1 ? 'Ilimitados' : s.maxClients.toLocaleString('es-AR')}`; }
  ctaCteClient(id: number) {
    const dialogRef = this.dialog.open(FormCtaCteClienteComponent,{
      disableClose: true,
      autoFocus: true,
      hasBackdrop: true,
      closeOnNavigation: false,
      data: {
        tipo: 'updateCtaCte',
        updateClient: id,
      },
    });
    dialogRef.afterClosed().subscribe(() => {
      this.refrescarModulo();
    });
  }

  altaCtaCteClient(id: number) {
    const dialogRef = this.dialog.open(CrudCtaCteClienteComponent,{
      disableClose: true,
      autoFocus: true,
      hasBackdrop: true,
      closeOnNavigation: false,
      data: {
        tipo: 'altaCtaCte',
        altaClient: id,
      },
    });
    dialogRef.afterClosed().subscribe(() => {
      this.refrescarModulo();
    });
  }
  
  updateClient(id: number) {
    const dialogRef = this.dialog.open(FormClientComponent, {
      disableClose: true,
      autoFocus: true,
      hasBackdrop: true,
      closeOnNavigation: false,
      data: {
        tipo: 'updateClient',
        updateClient: id,
      },
    });
    dialogRef.afterClosed().subscribe(() => {
      this.refrescarModulo();
    });
  }
  deleteCliento(id: number) {
    console.log(id);
    this.clientService.delete(id).subscribe(() => {
      this.refrescarModulo();
    });
  }
  deleteClient(id: number): void {
      const dialogRef = this.dialog.open(DialogGenericComponent, {
        disableClose: true,
        autoFocus: true,
        hasBackdrop: true,
        closeOnNavigation: false,
        data: {
          component: 'updateProduct', // O cualquier otro componente relevante
          data: `Eliminar`, // Aquí pasas el mensaje
          state: 'Eliminar',
          icon: 'delete', // Ícono que quieres mostrar
          message: `¿Estás seguro de eliminar el Cliente con ID ${id}?`,
        },
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result == true) {
          this.clientService.delete(id).subscribe((result) => {
            console.log(result);
            this.refrescarModulo();
          });
        } else {
          // no se ha borrado el Cliente
        }
      });
    }
}
