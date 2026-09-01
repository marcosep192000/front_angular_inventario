import { LICENSE_USABLE, licenseLimitReached, licenseStatusMessage } from './license';
describe('licencias',()=>{
  it('permite operar con VALID y GRACE_PERIOD',()=>{expect(LICENSE_USABLE).toContain('VALID');expect(LICENSE_USABLE).toContain('GRACE_PERIOD');});
  it('no permite operar sin activación',()=>expect(LICENSE_USABLE).not.toContain('NOT_ACTIVATED'));
  it('traduce estados técnicos',()=>expect(licenseStatusMessage('WRONG_INSTALLATION')).toBe('Esta licencia pertenece a otra instalación.'));
  it('respeta límites y considera -1 como ilimitado',()=>{expect(licenseLimitReached(5,5)).toBeTrue();expect(licenseLimitReached(5000,-1)).toBeFalse();});
});
