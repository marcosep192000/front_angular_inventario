export type CondicionIvaEmpresa =
  'RESPONSABLE_INSCRIPTO' | 'MONOTRIBUTISTA' | 'EXENTO' | 'CONSUMIDOR_FINAL';
export type RolUsuario = 'ADMIN' | 'VENDEDOR' | 'COMPRADOR';
export interface UsuarioEmpresa {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  pais?: string;
  role: RolUsuario;
  enabled: boolean;
  empresaId: number;
  fotoUrl?: string | null;
  permissions?: string[];
}
export interface UsuarioEmpresaRequest {
  nombre: string;
  apellido: string;
  email: string;
  password?: string | null;
  pais?: string;
  role: RolUsuario;
  enabled: boolean;
  permissions?: string[];
}
export interface Empresa {
  id: number;
  name: string;
  cuit: string;
  address: string;
  localidad?: string;
  provincia?: string;
  codigoPostal?: string;
  phone: string;
  email?: string;
  nombreFantasia?: string;
  ingresosBrutos?: string;
  inicioActividades?: string;
  puntoVenta?: number;
  sitioWeb?: string;
  condicionIva?: CondicionIvaEmpresa;
  logoUrl?: string | null;
  usuarios: UsuarioEmpresa[];
}
export type EmpresaRequest = Omit<Empresa, 'id' | 'usuarios' | 'logoUrl'>;
export interface CompanyResponse {
  id: number;
  name: string;
  logoUrl: string | null;
}
export interface PermisoEmpresa {
  codigo: string;
  nombre: string;
  descripcion?: string;
  grupo: string;
}
export type PermisosUsuarioResponse = UsuarioEmpresa;
export interface PermisosUsuarioRequest {
  role: RolUsuario;
  permissions: string[];
}
