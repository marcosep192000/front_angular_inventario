import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ModoFacturacion } from '../../../interfaces/arca';

export interface BillingModeDialogData {
  mode: ModoFacturacion;
  homologation: boolean;
}

@Component({
  selector: 'app-billing-mode-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './billing-mode-dialog.component.html',
  styleUrl: './billing-mode-dialog.component.css',
})
export class BillingModeDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: BillingModeDialogData,
    private ref: MatDialogRef<BillingModeDialogComponent>,
  ) {}

  confirm(): void {
    this.ref.close(true);
  }

  cancel(): void {
    this.ref.close(false);
  }
}
