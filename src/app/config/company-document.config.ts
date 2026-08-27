/**
 * Identidad visual y datos comerciales para todos los comprobantes.
 * Editá únicamente estos valores cuando cambie la empresa o su logo.
 */
export class CompanyDocumentConfig {
  static readonly legalName = 'Gajate Maria Florencia ';
  static readonly tradeName = 'Corralon Ruta 89';
  static readonly cuit = '27-35686937-6';
  static readonly address = '';
  static readonly phone = '';
  static readonly email = '';
  static readonly logoUrl = 'assets/logo.png';
  static readonly footerText = 'Gracias por elegirnos! "Corralon Ruta 89"';

  static get contactLine(): string {
    return [this.address, this.phone, this.email].filter(Boolean).join(' · ');
  }
}
