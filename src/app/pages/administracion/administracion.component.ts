import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { ToastrService } from 'ngx-toastr';
import { AdministracionService } from '../../services/administracion.service';
import { RolUsuario, UsuarioEmpresa } from '../../interfaces/administracion';
import { TokenService } from '../../services/token.service';
import { UiRefreshService } from '../../services/ui-refresh.service';
import { LicenseService } from '../../services/license.service';
import { HttpErrorResponse } from '@angular/common/http';
import { applyDuplicateResourceError } from '../../shared/forms/duplicate-resource-error';

@Component({
  selector: 'app-administracion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
  ],
  templateUrl: './administracion.component.html',
  styleUrl: './administracion.component.css',
})
export class AdministracionComponent implements OnInit {
  readonly roles: RolUsuario[] = ['ADMIN', 'VENDEDOR', 'COMPRADOR'];
  esAdmin = false;
  usuarios: UsuarioEmpresa[] = [];
  editandoUsuario: UsuarioEmpresa | null = null;
  logoSrc: string | null = null;
  fotosUsuarios: Record<number, string> = {};
  empresaForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    nombreFantasia: ['', Validators.maxLength(80)],
    cuit: ['', [Validators.required, Validators.maxLength(13)]],
    address: ['', [Validators.required, Validators.maxLength(80)]],
    phone: ['', [Validators.required, Validators.maxLength(20)]],
    email: [
      '',
      [Validators.required, Validators.email, Validators.maxLength(100)],
    ],
    ingresosBrutos: ['', Validators.maxLength(30)],
    inicioActividades: [''],
    puntoVenta: [1, [Validators.min(1), Validators.max(99999)]],
    sitioWeb: ['', Validators.maxLength(120)],
    condicionIva: ['RESPONSABLE_INSCRIPTO'],
  });
  usuarioForm = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    pais: ['Argentina'],
    role: ['VENDEDOR' as RolUsuario, Validators.required],
    enabled: [true],
  });
  constructor(
    private readonly fb: FormBuilder,
    private readonly api: AdministracionService,
    private readonly token: TokenService,
    private readonly toastr: ToastrService,
    private readonly uiRefresh: UiRefreshService,
    public readonly license: LicenseService,
  ) {}
  ngOnInit(): void {
    this.esAdmin = this.token
      .getAuthorities()
      .some((rol: string) => rol === 'ADMIN' || rol === 'ROLE_ADMIN');
    this.cargarEmpresa();
    this.cargarLogo();
    if (this.esAdmin) this.cargarUsuarios();
  }
  cargarEmpresa(): void {
    this.api.obtenerEmpresa().subscribe({
      next: (empresa) => this.empresaForm.patchValue(empresa),
      error: (error) => {
        if (error.status !== 400)
          this.toastr.error('No se pudo cargar la configuración de empresa.');
      },
    });
  }
  cargarUsuarios(): void {
    this.api.listarUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        usuarios.forEach((usuario) => this.cargarFoto(usuario.id));
      },
      error: () => this.toastr.error('No se pudieron cargar los usuarios.'),
    });
  }
  cargarLogo(): void {
    this.api
      .obtenerLogo()
      .subscribe({
        next: (blob) => (this.logoSrc = URL.createObjectURL(blob)),
        error: () => (this.logoSrc = null),
      });
  }
  cargarFoto(id: number): void {
    this.api
      .obtenerFotoUsuario(id)
      .subscribe({
        next: (blob) => (this.fotosUsuarios[id] = URL.createObjectURL(blob)),
      });
  }
  validarArchivo(file: File): boolean {
    const permitido = ['image/jpeg', 'image/png', 'image/webp'].includes(
      file.type,
    );
    if (!permitido || file.size > 5 * 1024 * 1024) {
      this.toastr.warning('Usá JPG, PNG o WEBP de hasta 5 MB.');
      return false;
    }
    return true;
  }
  alCambiarLogo(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.validarArchivo(file)) return;
    this.api.cargarLogo(file).subscribe({
      next: () => {
        this.cargarLogo();
        this.uiRefresh.actualizarLogo();
        this.toastr.success('Logo actualizado.');
      },
      error: (error) =>
        this.toastr.error(error?.error?.error || 'No se pudo cargar el logo.'),
    });
  }
  eliminarLogo(): void {
    this.api.eliminarLogo().subscribe({
      next: () => {
        this.logoSrc = null;
        this.uiRefresh.actualizarLogo();
        this.toastr.success('Logo eliminado.');
      },
    });
  }
  alCambiarFoto(usuario: UsuarioEmpresa, event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.validarArchivo(file)) return;
    this.api.cargarFotoUsuario(usuario.id, file).subscribe({
      next: () => {
        this.cargarFoto(usuario.id);
        this.uiRefresh.actualizarFotoUsuario();
        this.toastr.success('Foto actualizada.');
      },
      error: (error) =>
        this.toastr.error(error?.error?.error || 'No se pudo cargar la foto.'),
    });
  }
  eliminarFoto(usuario: UsuarioEmpresa): void {
    this.api.eliminarFotoUsuario(usuario.id).subscribe({
      next: () => {
        const foto = this.fotosUsuarios[usuario.id];
        if (foto) URL.revokeObjectURL(foto);
        delete this.fotosUsuarios[usuario.id];
        this.uiRefresh.actualizarFotoUsuario();
        this.toastr.success('Foto eliminada.');
      },
      error: (error) =>
        this.toastr.error(
          error?.error?.error || 'No se pudo eliminar la foto.',
        ),
    });
  }
  guardarEmpresa(): void {
    if (!this.esAdmin || this.empresaForm.invalid) {
      this.empresaForm.markAllAsTouched();
      return;
    }
    this.api.guardarEmpresa(this.empresaForm.getRawValue() as any).subscribe({
      next: (empresa) => {
        this.empresaForm.patchValue(empresa);
        this.toastr.success('Configuración de empresa guardada.');
      },
      error: (error) =>
        this.toastr.error(
          error?.error?.error || 'No se pudo guardar la empresa.',
        ),
    });
  }
  editarUsuario(usuario?: UsuarioEmpresa): void {
    this.editandoUsuario = usuario || null;
    this.usuarioForm.reset(
      usuario
        ? { ...usuario, password: '' }
        : { pais: 'Argentina', role: 'VENDEDOR', enabled: true, password: '' },
    );
  }
  guardarUsuario(): void {
    if (!this.editandoUsuario && this.limiteUsuariosAlcanzado) {
      this.toastr.warning('Alcanzaste el límite de usuarios permitido por tu plan.');
      return;
    }
    if (!this.esAdmin || this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }
    const valor = this.usuarioForm.getRawValue();
    if (
      !this.editandoUsuario &&
      (!valor.password || valor.password.length < 6)
    ) {
      this.toastr.warning('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    const request = { ...valor, password: valor.password || null } as any;
    const operacion = this.editandoUsuario
      ? this.api.actualizarUsuario(this.editandoUsuario.id, request)
      : this.api.crearUsuario(request);
    operacion.subscribe({
      next: () => {
        this.toastr.success(
          this.editandoUsuario ? 'Usuario actualizado.' : 'Usuario creado.',
        );
        this.editarUsuario();
        this.cargarUsuarios();
      },
      error: (error: HttpErrorResponse) => { const duplicate=applyDuplicateResourceError(error,this.usuarioForm); this.toastr.error(duplicate||error.error?.message||error.error?.error||'No se pudo guardar el usuario.'); },
    });
  }
  alternarUsuario(usuario: UsuarioEmpresa): void {
    if (!usuario.enabled && this.limiteUsuariosAlcanzado) {
      this.toastr.warning('Alcanzaste el límite de usuarios permitido por tu plan.');
      return;
    }
    this.api
      .actualizarUsuario(usuario.id, {
        ...usuario,
        password: null,
        enabled: !usuario.enabled,
      })
      .subscribe({
        next: () => this.cargarUsuarios(),
        error: (error) =>
          this.toastr.error(
            error?.error?.error || 'No se pudo actualizar el usuario.',
          ),
      });
  }
  get limiteUsuariosAlcanzado(): boolean { const s=this.license.snapshot; return Boolean(s && s.maxUsers !== -1 && s.currentUsers >= s.maxUsers); }
  get resumenLicenciaUsuarios(): string { const s=this.license.snapshot; return !s ? '' : `Usuarios habilitados: ${s.currentUsers} / ${s.maxUsers === -1 ? 'Ilimitados' : s.maxUsers}`; }
  eliminarUsuario(usuario: UsuarioEmpresa): void {
    if (!confirm(`¿Eliminar a ${usuario.nombre} ${usuario.apellido}?`)) return;
    this.api
      .eliminarUsuario(usuario.id)
      .subscribe({
        next: () => this.cargarUsuarios(),
        error: (error) =>
          this.toastr.error(
            error?.error?.error || 'No se pudo eliminar el usuario.',
          ),
      });
  }
}
