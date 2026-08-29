export type CondicionIvaEmpresa = 'RESPONSABLE_INSCRIPTO' | 'MONOTRIBUTISTA' | 'EXENTO' | 'CONSUMIDOR_FINAL';
export type RolUsuario = 'ADMIN' | 'VENDEDOR' | 'COMPRADOR';
export interface UsuarioEmpresa { id: number; nombre: string; apellido: string; email: string; pais?: string; role: RolUsuario; enabled: boolean; empresaId: number; fotoUrl?: string | null; }
export interface UsuarioEmpresaRequest { nombre: string; apellido: string; email: string; password?: string | null; pais?: string; role: RolUsuario; enabled: boolean; }
export interface Empresa { id: number; name: string; cuit: string; address: string; phone: string; email: string; nombreFantasia?: string; ingresosBrutos?: string; inicioActividades?: string; puntoVenta?: number; sitioWeb?: string; condicionIva?: CondicionIvaEmpresa; usuarios: UsuarioEmpresa[]; }
export type EmpresaRequest = Omit<Empresa, 'id' | 'usuarios'>;
export interface CompanyResponse { id: number; name: string; logoUrl: string | null; }
