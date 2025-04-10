import { Component, Inject, OnInit } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CategoryService } from '../../../../services/category.service';
import { CommonModule } from '@angular/common';
import { IconComponent } from "../../../../shared/dasboard/icon/icon.component";
@Component({
  selector: 'app-form-category',
  standalone: true,
  imports: [CommonModule,
    MatInputModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    ReactiveFormsModule, IconComponent],
  templateUrl: './form-category.component.html',
  styleUrl: './form-category.component.css',
})
export class FormCategoryComponent implements OnInit {
  formGroup!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<FormCategoryComponent>,
    private fb: FormBuilder,
    private categoryService: CategoryService
  ) {}
  ngOnInit(): void {
    this.initForm();
  }

  
  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
    this.categoryService
      .createCategory(this.formGroup.value)
      .subscribe((data) => {
        this.dialogRef.close(data);
      });
  }
  update(): void {
   
    this.categoryService.updateCategory(this.data.idCategory,this.formGroup.value).subscribe((data) => {
      console.log(data + ' updated', this.data.idCategory);
      this.dialogRef.close(data);
    });

  }




  //inicializar formulario con los campos correspondientes a la seleccion de item si se preciona en update si no
  //inicializar formulario vacío 
  initForm() {
    if (this.data.idCategory != null) {
      this.categoryService.finById(this.data.idCategory).subscribe((datos) => {
    console.log(datos.nameCategory)
        this.formGroup = this.fb.group({
          nameCategory:  datos.nameCategory ,
          descriptionCategory:datos.descriptionCategory ,
        });
      });
    }
    else {
      this.formGroup = this.fb.group({
        nameCategory: ['', [Validators.required, Validators.minLength(6)]],
        descriptionCategory: ['', [Validators.required, Validators.minLength(6)]],
      });
    }
  }
}
