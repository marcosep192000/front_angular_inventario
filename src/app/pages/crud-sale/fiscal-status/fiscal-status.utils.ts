import {
  ArcaFiscalDocumentResponse,
  ArcaStatusResponse,
} from '../../../interfaces/arca';
export function arcaAvailable(
  status: ArcaStatusResponse | null,
  canEmit: boolean,
): boolean {
  return Boolean(status?.enabled && status.configured && canEmit);
}
export function fiscalActions(
  document: ArcaFiscalDocumentResponse,
  permissions: string[],
): string[] {
  if (
    document.fiscalStatus === 'PROCESSING' ||
    document.fiscalStatus === 'AUTHORIZED' ||
    document.fiscalStatus === 'REJECTED' ||
    document.fiscalStatus === 'ERROR'
  )
    return [];
  if (document.fiscalStatus === 'PENDING')
    return permissions.includes('COMPROBANTES_FISCALES_EMITIR')
      ? ['AUTHORIZE']
      : [];
  if (document.fiscalStatus === 'RECONCILIATION_REQUIRED') {
    const safe =
      document.reconciliationResult === 'NOT_FOUND_SAFE_TO_RETRY' ||
      document.retryAllowed === true;
    return safe
      ? permissions.includes('COMPROBANTES_FISCALES_REINTENTAR')
        ? ['RETRY']
        : []
      : permissions.includes('COMPROBANTES_FISCALES_CONSULTAR')
        ? ['RECONCILE']
        : [];
  }
  return [];
}
