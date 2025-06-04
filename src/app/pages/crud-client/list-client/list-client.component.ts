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
  constructor(public clientService: ClientService, public dialog: MatDialog) {}
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator; // Añadimos el paginador al datasource
  }
  
  ngOnInit(): void {
    this.getClients();
  }

  getClients(): void {
    this.clientService.getClients().subscribe((client) => {
      const filteredProducts = client.filter(
        (client) => client.status.valueOf() === false
      );
      this.dataSource.data = filteredProducts;
    });
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
      this.getClients();
    });
  }
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
      this.getClients();
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
      this.getClients();
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
      this.getClients();
    });
  }
  deleteCliento(id: number) {
    console.log(id);
    this.clientService.delete(id).subscribe(() => {
      this.getClients();
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
            this.getClients();
          });
        } else {
          // no se ha borrado el Cliente
        }
      });
    }
}
