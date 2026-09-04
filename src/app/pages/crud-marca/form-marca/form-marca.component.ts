import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { MarcaService } from '../../../services/marca.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Marca } from '../../../interfaces/marca';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-form-marca',
  standalone: true,
  imports: [
    ToastrModule,
    MatInputModule,
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    FormsModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
  ],
  templateUrl: './form-marca.component.html',
  styleUrl: './form-marca.component.css',
})
export class FormMarcaComponent implements OnInit {
  formGroup!: FormGroup;
  marcas: Marca[] = [];
  saving = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<FormMarcaComponent>,
    public dialog: MatDialog,
    private marcaService: MarcaService,
    private router: Router,
    private HttpClient: HttpClient,
    private fb: FormBuilder,
    private toastr: ToastrService,
  ) {

    this.formGroup = this.fb.group({
      marca: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  ngOnInit(): void {
   
  }
  cancel() {
    this.dialogRef.close();
  }
  save() {
    if (this.saving) return;
    if (this.formGroup.valid) {
    this.saving = true;
    this.marcaService.saveMarca(this.formGroup.value)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe((data) => {
      this.toastr.success("Marca guardada correctamente");
      this.dialogRef.close({ saved: true, data });
    }, (error) => {
      this.toastr.error(error?.error?.message || "No se pudo guardar la marca.");
    });  
}else {this.formGroup.markAllAsTouched(); this.toastr.error('Revisá los campos de la marca.');}

  
  }



  update() { }

  allMarca() {
    this.marcaService.allMarca().subscribe(marca => { 
      this.marcas = marca;
      console.log(marca);
    })   
  }
}
 
