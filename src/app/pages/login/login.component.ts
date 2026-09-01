import { Component, inject } from '@angular/core';
import { AccessoService } from '../../services/accesso.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Login } from '../../interfaces/Login';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { TokenService } from '../../services/token.service';
import { MatIcon } from "@angular/material/icon";
import { MatCheckbox } from "@angular/material/checkbox";
import { MatDivider } from "@angular/material/divider";
import { LicenseService } from '../../services/license.service';
import { LICENSE_USABLE } from '../../interfaces/license';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIcon,
    MatCheckbox,
    MatDivider
],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  hidePassword = true;
  private accesoService = inject(AccessoService);
  private route = inject(Router);
  private formBuild = inject(FormBuilder);
  private tokenService = inject(TokenService);
  private licenseService = inject(LicenseService);

  public formGroup: FormGroup = this.formBuild.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  iniciarSession() {
    if (this.formGroup.invalid) return;

    const objeto: Login = {
      email: this.formGroup.value.email!,
      password: this.formGroup.value.password!,
    };

    this.accesoService.login(objeto).subscribe({
      next: (data) => {
        if (data.accessToken) {
          this.tokenService.setSession(data);
          this.licenseService.obtenerEstado(true).subscribe({
            next: license => this.route.navigateByUrl(LICENSE_USABLE.includes(license.status) ? this.tokenService.getDefaultRoute() : '/activacion'),
            error: () => this.route.navigate(['/activacion'], { queryParams: { connectionError: 1 } }),
          });
        } else {
          alert('Credenciales incorrectas');
        }
      },
      error: (error) => {
        console.error(error);
        alert('Error al iniciar sesión. Intente nuevamente.');
      },
    });
  }

  register() {
    this.route.navigate(['/registro']);
  }
}
