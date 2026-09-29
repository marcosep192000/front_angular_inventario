import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { LICENSE_USABLE, LicenseStatus, licenseStatusMessage } from '../../interfaces/license';
import { LicenseService } from '../../services/license.service';
import { TokenService } from '../../services/token.service';

@Component({
  selector: 'app-license', standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatInputModule],
  templateUrl: './license.component.html', styleUrl: './license.component.css',
})
export class LicenseComponent implements OnInit {
  status: LicenseStatus | null = null;
  installationId = '';
  license = '';
  loading = true;
  activating = false;
  connectionError = false;
  activationSucceeded = false;

  constructor(private api: LicenseService, private router: Router, private token: TokenService, private toast: ToastrService) {}
  ngOnInit(): void { this.load(); }
  load(): void { this.loading = true; this.api.obtenerEstado(true).pipe(finalize(() => this.loading = false)).subscribe({ next: status => { this.status = status; this.installationId = status.installationId || ''; if (!this.installationId) this.loadId(); }, error: () => { this.connectionError = true; this.loadId(); } }); }
  loadId(): void { this.api.obtenerInstallationId().subscribe({ next: id => this.installationId = id, error: () => this.connectionError = true }); }
  copy(): void { navigator.clipboard?.writeText(this.installationId).then(() => this.toast.success('Código copiado.')); }
  file(event: Event): void { const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return; if (!file.name.toLowerCase().endsWith('.lic')) { this.toast.warning('Seleccioná un archivo .lic.'); return; } const reader = new FileReader(); reader.onload = () => this.license = String(reader.result || ''); reader.readAsText(file); }
  activate(): void { const value = this.license.trim(); if (!value || this.activating) return; this.activating = true; this.api.activar(value).pipe(finalize(() => this.activating = false)).subscribe({ next: status => { this.status = status; if (!LICENSE_USABLE.includes(status.status)) { this.toast.error(licenseStatusMessage(status.status)); return; } this.toast.success('Inventario Pixel fue activado correctamente.'); if (this.token.isTokenValid()) { this.api.obtenerEstado(true).subscribe(() => this.router.navigateByUrl(this.token.getDefaultRoute())); return; } this.activationSucceeded = true; }, error: error => this.toast.error(error.error?.message || error.error?.error || 'No se pudo activar la licencia.') }); }
  continueToRegistration(): void { this.router.navigate(['/registro']); }
  continueToLogin(): void { this.router.navigate(['/login']); }
  message(): string { return this.status ? licenseStatusMessage(this.status.status) : ''; }
}
