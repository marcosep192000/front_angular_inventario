import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { Usuario } from '../../interfaces/Usuario';
import { AccessoService } from '../../services/accesso.service';

@Component({
  selector: 'app-registro', standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule],
  templateUrl: './registro.component.html', styleUrl: './registro.component.css',
})
export class RegistroComponent {
  private readonly access = inject(AccessoService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  submitting = false;
  error = '';
  hidePassword = true;
  readonly form = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  register(): void {
    if (this.form.invalid || this.submitting) return;
    this.submitting = true;
    this.error = '';
    const value = this.form.getRawValue();
    const request = { email: value.email!, password: value.password! } as Usuario;
    this.access.registrarse(request).pipe(finalize(() => this.submitting = false)).subscribe({
      next: () => this.router.navigate(['/login']),
      error: response => this.error = response.error?.message || response.error || 'No se pudo crear el administrador inicial.',
    });
  }

  goToLogin(): void { this.router.navigate(['/login']); }
}
