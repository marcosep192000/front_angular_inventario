import { Component, OnInit } from '@angular/core';
import { FileUploadService } from '../../../services/file-upload.service';
import { Toast, ToastrModule, ToastrService } from 'ngx-toastr';
import { HttpEventType } from '@angular/common/http';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Supplier } from '../../../interfaces/supplier';
import { SupplierService } from '../../../services/supplier.service';

@Component({
  selector: 'app-add-excel-list-product',
  standalone: true,
  imports: [ToastrModule,
     MatInputModule,
      CommonModule,
      MatIconModule,
      MatDialogModule,
      MatButtonModule,
      FormsModule,
      MatSelectModule,
      ReactiveFormsModule,
      MatSlideToggleModule,],
  templateUrl: './add-excel-list-product.component.html',
  styleUrl: './add-excel-list-product.component.css'
})
export class AddExcelListProductComponent implements OnInit {
  selectedFile: File | null = null;
 // Reemplaza con el ID del proveedor correspondiente
  uploadProgress: number = 0;

  constructor(private fileUploadService: FileUploadService , private toast : ToastrService,private supplierService: SupplierService){}
  ngOnInit(): void {
    this.loadSuplier();
  }

dataSuplier: Supplier[] = []; 
 
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }
  loadSuplier() {
    this.supplierService.getAllSuppliers().subscribe((supplierInfo) => {
      this.dataSuplier = supplierInfo;
      console.log(this.dataSuplier);
    });
  }
  selectedSupplierId: number = 1;

  onSupplierChange(event: any) {
    console.log('ID del proveedor seleccionado:', this.selectedSupplierId);
    // Aquí puedes agregar lógica adicional si es necesario
  }
  onUpload(): void {
    if (this.selectedFile) {
      this.fileUploadService.uploadFile(this.selectedFile, this.selectedSupplierId).subscribe(
        (event) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.uploadProgress = Math.round((100 * event.loaded) / (event.total ?? 1));
          } else if (event.type === HttpEventType.Response) {
            console.log('Archivo subido con éxito:', event.body);
            this.toast.success(event.body.message || 'Archivo subido con éxito');
          }
        },
        (error) => {
          console.error('Error al subir el archivo:', error);
          this.toast.error('Error al subir el archivo');
        }
      );
    } else {
      this.toast.info('Por favor, selecciona un archivo primero.');
    }
  }
  
  




}
