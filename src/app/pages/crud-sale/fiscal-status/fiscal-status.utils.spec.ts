import { arcaAvailable, fiscalActions } from './fiscal-status.utils';
import { FiscalAuthorizationStatus } from '../../../interfaces/arca';
describe('ARCA UI', () => {
  const doc = (fiscalStatus: FiscalAuthorizationStatus, extra = {}) => ({
    ticketId: 1,
    fiscalStatus,
    ...extra,
  });
  it('mantiene ARCA deshabilitado sin configuración', () =>
    expect(arcaAvailable(null, true)).toBeFalse());
  it('requiere configuración, habilitación y permiso', () =>
    expect(
      arcaAvailable({ configured: true, enabled: true }, true),
    ).toBeTrue());
  it('PENDING ofrece autorizar con permiso', () =>
    expect(
      fiscalActions(doc('PENDING'), ['COMPROBANTES_FISCALES_EMITIR']),
    ).toEqual(['AUTHORIZE']));
  it('AUTHORIZED, REJECTED, PROCESSING y ERROR bloquean acciones', () =>
    (
      [
        'AUTHORIZED',
        'REJECTED',
        'PROCESSING',
        'ERROR',
      ] as FiscalAuthorizationStatus[]
    ).forEach((s) =>
      expect(fiscalActions(doc(s), ['COMPROBANTES_FISCALES_EMITIR'])).toEqual(
        [],
      ),
    ));
  it('reconciliación requerida solo ofrece reconciliar inicialmente', () =>
    expect(
      fiscalActions(doc('RECONCILIATION_REQUIRED'), [
        'COMPROBANTES_FISCALES_CONSULTAR',
      ]),
    ).toEqual(['RECONCILE']));
  it('retry aparece únicamente cuando backend lo declara seguro', () =>
    expect(
      fiscalActions(
        doc('RECONCILIATION_REQUIRED', {
          reconciliationResult: 'NOT_FOUND_SAFE_TO_RETRY',
        }),
        ['COMPROBANTES_FISCALES_REINTENTAR'],
      ),
    ).toEqual(['RETRY']));
});
