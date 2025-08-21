import { Component } from '@angular/core';
import { LowStockByProvider, Product } from '../../../../../interfaces/producto-bajo-stock';
import { ProductoBajoStockService } from '../../../../../services/producto-bajo-stock.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';  // 👈 importante importar
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ToastrModule } from 'ngx-toastr';

@Component({
  selector: 'app-bajo-stock',
  standalone: true,
  imports: [
    CommonModule,
    MatDatepickerModule,
    ToastrModule,
    MatInputModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    FormsModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
  ],
  templateUrl: './bajo-stock.component.html',
  styleUrl: './bajo-stock.component.css'
})
export class BajoStockComponent {
  lowStockList: LowStockByProvider[] = [];
  loading = false;

  constructor(private lowStockService: ProductoBajoStockService) {}

  ngOnInit(): void {
    this.fetchLowStockProducts();
  }

  fetchLowStockProducts(): void {
    this.loading = true;
    this.lowStockService.getLowStockProducts().subscribe({
      next: (data) => {
        this.lowStockList = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando productos', err);
        this.loading = false;
      }
    });
  }

  // 👇 corregido: se usa LowStockByProvider en vez de "o"
  toggleSelectAll(provider: LowStockByProvider, event: any): void {
    provider.products.forEach((p: Product) => p.selected = event.target.checked);
  }

downloadPDF(): void {
  this.lowStockList.forEach(provider => {
    const productos = provider.products || [];
    const selected = productos.filter(p => p.selected);

    if (selected.length > 0) {
      // crear un nuevo PDF por proveedor
      const doc = new jsPDF();

      // título proveedor
      doc.setFontSize(14);
      doc.text(`Pedido de reposición`, 10, 15);
      doc.setFontSize(12);
      doc.text(`Proveedor: ${provider.name}`, 10, 25);

      // tabla con productos seleccionados
      autoTable(doc, {
        startY: 35,
        head: [['Producto', 'Stock']],
        body: selected.map((p: Product) => [p.name, p.stock.toString()]),
        margin: { left: 10, right: 10 }
      });

      // calcular totales
      const totalProductos = selected.length;
      const totalStock = selected.reduce((sum, p) => sum + p.stock, 0);

      // escribir totales debajo de la tabla
      const finalY = (doc as any).lastAutoTable.finalY;
      doc.setFontSize(11);
      doc.text(`TOTAL productos: ${totalProductos}`, 10, finalY + 10);
      doc.text(`TOTAL stock a reponer: ${totalStock}`, 10, finalY + 17);

      // guardar el PDF con nombre del proveedor
      const fileName = `pedido_${provider.name.replace(/\s+/g, '_')}.pdf`;
      doc.save(fileName);
    }
  });
}


}
