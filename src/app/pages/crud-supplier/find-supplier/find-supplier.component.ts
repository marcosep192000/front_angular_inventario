import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Supplier } from '../../../interfaces/supplier';
import { SupplierService } from '../../../services/supplier.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Console } from 'console';
import { CommonModule } from '@angular/common';
import { ToastrModule, ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-find-supplier',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    ToastrModule,
    MatSelectModule,
    CommonModule,
  ],
  templateUrl: './find-supplier.component.html',
  styleUrl: './find-supplier.component.css',
})
export class FindSupplierComponent implements OnInit {
  @Output() mensajeEnviado = new EventEmitter<number>();
value: any;

suppliers: Supplier[] = [];
selectedSupplier: Supplier | null = null; // Ningún proveedor seleccionado por defecto

constructor(private supplierService: SupplierService) {}

ngOnInit(): void {
  this.getAllSuppliers();
}

getAllSuppliers() {
  this.supplierService.getAllSuppliers().subscribe((data) => {
    this.suppliers = data;
  });
}

onSupplierChange() {
  // Este método se llama cuando el usuario selecciona un proveedor
  if (this.selectedSupplier) {
    // Emitir el ID del proveedor seleccionado
    this.mensajeEnviado.emit(this.selectedSupplier.id);
  }
}
}