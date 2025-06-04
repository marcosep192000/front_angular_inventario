import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { IconComponent } from '../../../../../shared/dasboard/icon/icon.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
@Component({
  selector: 'app-cash-amount-dialog',
  standalone: true,
  imports: [MatDialogModule,MatFormFieldModule, CommonModule,
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
      MatTooltipModule,],
  templateUrl: './cash-amount-dialog.component.html',
  styleUrl: './cash-amount-dialog.component.css'
})
export class CashAmountDialogComponent {
  monto: number | null = null;

  constructor(private dialogRef: MatDialogRef<CashAmountDialogComponent>) {}

  onConfirm() {
    this.dialogRef.close(this.monto);
  }

  onCancel() {
    this.dialogRef.close(null);
  }
}
