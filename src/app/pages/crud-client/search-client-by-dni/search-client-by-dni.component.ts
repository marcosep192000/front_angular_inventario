import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { startWith } from 'rxjs';
import { Client } from '../../../interfaces/Client';
import { ClientService } from '../../../services/client.service';

@Component({
  selector: 'app-search-client-by-dni',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './search-client-by-dni.component.html',
  styleUrl: './search-client-by-dni.component.css',
})
export class SearchClientByDniComponent implements OnInit {
  readonly search = new FormControl('', { nonNullable: true });
  clients: Client[] = [];
  filtered: Client[] = [];
  loading = true;
  error = '';
  constructor(
    public readonly dialogRef: MatDialogRef<SearchClientByDniComponent>,
    private readonly clientService: ClientService,
  ) {}
  ngOnInit(): void {
    this.clientService.getClients().subscribe({
      next: (clients) => {
        this.clients = clients;
        this.loading = false;
        this.applyFilter(this.search.value);
      },
      error: () => {
        this.loading = false;
        this.error = 'No se pudo cargar la lista de clientes.';
      },
    });
    this.search.valueChanges
      .pipe(startWith(''))
      .subscribe((value) => this.applyFilter(value));
  }
  select(client: Client): void {
    this.dialogRef.close(client);
  }
  close(): void {
    this.dialogRef.close();
  }
  fullName(client: Client): string {
    return (
      `${client.name || ''} ${client.lastName || ''}`.trim() ||
      'Cliente sin nombre'
    );
  }
  initials(client: Client): string {
    return (
      `${client.name?.[0] || ''}${client.lastName?.[0] || ''}`.toUpperCase() ||
      '?'
    );
  }
  private applyFilter(value: string): void {
    const words = this.normalize(value).split(/\s+/).filter(Boolean);
    this.filtered = this.clients
      .filter((client) => {
        const searchable = this.normalize(
          [
            client.name,
            client.lastName,
            client.cuit,
            client.tel,
            client.telefono,
            client.email,
          ]
            .filter(Boolean)
            .join(' '),
        );
        return words.every((word) => searchable.includes(word));
      })
      .slice(0, 30);
  }
  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}
