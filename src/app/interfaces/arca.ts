export type ModoFacturacion = 'INTERNA' | 'ARCA';
export type FiscalAuthorizationStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'AUTHORIZED'
  | 'REJECTED'
  | 'RECONCILIATION_REQUIRED'
  | 'ERROR';
export type ArcaEnvironment = 'HOMOLOGACION' | 'PRODUCCION';
export type ReconciliationResult =
  'AUTHORIZED' | 'MISMATCH_MANUAL_REVIEW' | 'NOT_FOUND_SAFE_TO_RETRY' | string;
export interface ArcaConfigurationRequest {
  enabled: boolean;
  environment: ArcaEnvironment;
  cuitRepresentado?: string | null;
  puntoVenta?: number | null;
  certificatePath?: string | null;
  privateKeyPath?: string | null;
  certificateExpiration?: string | null;
  connectionTimeout: number;
  readTimeout: number;
  active: boolean;
}
export interface ArcaConfigurationResponse extends ArcaConfigurationRequest {
  id?: number;
  configurado?: boolean;
  certificateConfigured?: boolean;
  privateKeyConfigured?: boolean;
  message?: string | null;
}
export interface ArcaStatusResponse {
  configured: boolean;
  enabled: boolean;
  environment?: ArcaEnvironment | null;
  puntoVenta?: number | null;
  certificateConfigured?: boolean;
  privateKeyConfigured?: boolean;
  authenticationAvailable?: boolean;
  certificateExpiration?: string | null;
  certificateExpired?: boolean;
  certificateValid?: boolean;
}
export interface ArcaAuthenticationTestResponse {
  success: boolean;
  expiresAt?: string | null;
  message?: string | null;
}
export interface WsfeServerStatus {
  appServer?: string | boolean | null;
  dbServer?: string | boolean | null;
  authServer?: string | boolean | null;
}
export interface WsfeStatusResponse extends WsfeServerStatus {
  success?: boolean;
  message?: string | null;
}
export interface ArcaFiscalMessage {
  code?: string | number | null;
  message: string;
}
export interface ArcaFiscalDocumentResponse {
  ticketId: number;
  modoFacturacion?: ModoFacturacion;
  fiscalStatus: FiscalAuthorizationStatus;
  tipoComprobante?: string | null;
  puntoVenta?: number | null;
  numeroComprobante?: number | string | null;
  comprobanteCompleto?: string | null;
  cae?: string | null;
  caeVencimiento?: string | null;
  observaciones?: ArcaFiscalMessage[] | string[] | null;
  errores?: ArcaFiscalMessage[] | string[] | null;
  reconciliationResult?: ReconciliationResult | null;
  retryAllowed?: boolean;
  message?: string | null;
  qrUrl?: string | null;
}
export interface ArcaFiscalPreview {
  ticketId: number;
  tipoComprobante?: string | null;
  receptor?: string | null;
  total?: number | null;
  message?: string | null;
}
