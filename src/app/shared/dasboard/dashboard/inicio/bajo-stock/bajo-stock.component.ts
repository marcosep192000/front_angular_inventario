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
import { AdministracionService } from '../../../../../services/administracion.service';
import { Empresa } from '../../../../../interfaces/administracion';
import { firstValueFrom } from 'rxjs';

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
  empresa: Partial<Empresa> = {};

  constructor(
    private lowStockService: ProductoBajoStockService,
    private administracionService: AdministracionService,
  ) {}

  ngOnInit(): void {
    this.fetchLowStockProducts();
    this.administracionService.obtenerEmpresa().subscribe({
      next: empresa => this.empresa = empresa,
      error: () => this.empresa = {},
    });
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

async downloadPDF(): Promise<void> {
  const logo = await this.obtenerLogoPdf();
  this.lowStockList.forEach(provider => {
    const productos = provider.products || [];
    const selected = productos.filter(p => p.selected);

    if (selected.length > 0) {
      // crear un nuevo PDF por proveedor
      const doc = new jsPDF();

      if (logo) doc.addImage(logo, 'PNG', 10, 8, 22, 22);
      const inicioTexto = logo ? 36 : 10;
      doc.setFontSize(16);
      doc.text(this.empresa.nombreFantasia || this.empresa.name || 'Empresa', inicioTexto, 15);
      doc.setFontSize(9);
      doc.text(`CUIT ${this.empresa.cuit || '-'} · ${this.empresa.phone || ''}`, inicioTexto, 21);

      doc.setFontSize(14);
      doc.text(`Pedido de reposición`, 10, 38);
      doc.setFontSize(12);
      doc.text(`Proveedor: ${provider.name}`, 10, 47);

      // tabla con productos seleccionados
      autoTable(doc, {
        startY: 55,
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

private obtenerLogoPdf(): Promise<string | null> {
  return firstValueFrom(this.administracionService.obtenerLogo())
    .then(blob => new Promise<string>((resolve, reject) => {
      const lector = new FileReader();
      lector.onloadend = () => resolve(String(lector.result));
      lector.onerror = () => reject();
      lector.readAsDataURL(blob);
    }))
    .catch(() => null);
}


}
