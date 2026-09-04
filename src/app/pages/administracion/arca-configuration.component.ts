import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import {
  ArcaConfigurationRequest,
  ArcaEnvironment,
  ArcaStatusResponse,
  WsfeStatusResponse,
} from '../../interfaces/arca';
import { ArcaService } from '../../services/arca.service';
import { AdministracionService } from '../../services/administracion.service';
import { Empresa } from '../../interfaces/administracion';
@Component({
  selector: 'app-arca-configuration',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
  ],
  templateUrl: './arca-configuration.component.html',
  styleUrl: './arca-configuration.component.css',
})
export class ArcaConfigurationComponent implements OnInit {
  status: ArcaStatusResponse | null = null;
  empresa: Empresa | null = null;
  wsfe: WsfeStatusResponse | null = null;
  loading = true;
  saving = false;
  testingAuth = false;
  testingWsfe = false;
  exists = false;
  form = this.fb.group({
    enabled: [false],
    environment: [
      { value: 'HOMOLOGACION' as ArcaEnvironment, disabled: true },
      Validators.required,
    ],
    certificatePath: [
      'C:\\ProgramData\\InventarioPixel\\arca\\certificado.crt',
    ],
    privateKeyPath: ['C:\\ProgramData\\InventarioPixel\\arca\\private.key'],
    certificateExpiration: [''],
    connectionTimeout: [
      10,
      [Validators.required, Validators.min(1), Validators.max(300)],
    ],
    readTimeout: [
      30,
      [Validators.required, Validators.min(1), Validators.max(600)],
    ],
    active: [true],
  });
  constructor(
    private fb: FormBuilder,
    private api: ArcaService,
    private companyApi: AdministracionService,
    private toast: ToastrService,
  ) {}
  ngOnInit() {
    this.loadCompany();
    this.load();
  }
  loadCompany() {
    this.companyApi.obtenerEmpresa().subscribe({
      next: (empresa) => (this.empresa = empresa),
      error: () => (this.empresa = null),
    });
  }
  get empresaCompleta(): boolean {
    const e = this.empresa;
    return Boolean(
      e?.name?.trim() &&
      e.cuit?.replace(/\D/g, '').length === 11 &&
      e.condicionIva &&
      e.address?.trim() &&
      e.localidad?.trim() &&
      Number(e.puntoVenta) > 0,
    );
  }
  get cuitEmpresa(): string {
    const digits = this.empresa?.cuit?.replace(/\D/g, '') || '';
    return digits.length === 11
      ? `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`
      : 'No configurado';
  }
  get diagnosticsDisabled(): boolean {
    return (
      this.loading ||
      this.saving ||
      !this.exists ||
      !this.status?.enabled ||
      !this.status.certificateConfigured ||
      !this.status.privateKeyConfigured
    );
  }
  load() {
    this.loading = true;
    this.api.getStatus().subscribe({
      next: (s) => {
        this.status = s;
        this.api
          .getConfiguration()
          .pipe(finalize(() => (this.loading = false)))
          .subscribe({
            next: (c) => {
              this.exists = true;
              this.form.patchValue(c);
            },
            error: () => (this.exists = false),
          });
      },
      error: (e) => {
        this.loading = false;
        this.toast.error(this.message(e, 'No se pudo consultar ARCA.'));
      },
    });
  }
  save() {
    if (this.form.invalid || this.saving) return;
    this.saving = true;
    const v = this.form.getRawValue();
    const body: ArcaConfigurationRequest = {
      enabled: !!v.enabled,
      environment: 'HOMOLOGACION',
      cuitRepresentado: null,
      puntoVenta: null,
      certificatePath: v.certificatePath || null,
      privateKeyPath: v.privateKeyPath || null,
      certificateExpiration: v.certificateExpiration || null,
      connectionTimeout: Number(v.connectionTimeout),
      readTimeout: Number(v.readTimeout),
      active: !!v.active,
    };
    const op = this.exists
      ? this.api.updateConfiguration(body)
      : this.api.createConfiguration(body);
    op.pipe(finalize(() => (this.saving = false))).subscribe({
      next: () => {
        this.exists = true;
        this.toast.success('Configuración ARCA guardada correctamente.');
        this.load();
      },
      error: (e) =>
        this.toast.error(
          this.message(e, 'No se pudo guardar la configuración ARCA.'),
        ),
    });
  }
  testAuth() {
    if (this.testingAuth || this.diagnosticsDisabled) return;
    this.testingAuth = true;
    this.api
      .testAuthentication()
      .pipe(finalize(() => (this.testingAuth = false)))
      .subscribe({
        next: (r) =>
          this.toast.success(
            r.expiresAt
              ? `Autenticación WSAA correcta. Vence ${new Date(r.expiresAt).toLocaleString('es-AR')}.`
              : 'Autenticación WSAA correcta.',
          ),
        error: (e) =>
          this.toast.error(this.message(e, 'Falló la autenticación WSAA.')),
      });
  }
  testWsfe() {
    if (this.testingWsfe || this.diagnosticsDisabled) return;
    this.testingWsfe = true;
    this.api
      .getWsfeStatus()
      .pipe(finalize(() => (this.testingWsfe = false)))
      .subscribe({
        next: (r) => {
          this.wsfe = r;
          this.toast.success('Estado WSFE consultado.');
        },
        error: (e) =>
          this.toast.error(this.message(e, 'No se pudo consultar WSFE.')),
      });
  }
  private message(e: unknown, fallback: string) {
    const x = e as { error?: { message?: string; error?: string } };
    return x.error?.message || x.error?.error || fallback;
  }
}
