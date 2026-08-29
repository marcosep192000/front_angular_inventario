import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';

const TOKEN_KEY = 'token';
const USERNAME_KEY = 'username';
const AUTHORITIES_KEY = 'authorities';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  loggedIn = new BehaviorSubject<Boolean>(false);
  roles: string[] = [];
  private helper: JwtHelperService | null = null; // Manejo seguro para SSR
  private accessToken: string | null = null;

  constructor(private router: Router) {
    if (this.isBrowser()) {
      this.helper = new JwtHelperService();
      this.checkToken();
    }
  }

  // Verificación de que estamos en un entorno de navegador antes de acceder a localStorage
  private isBrowser(): boolean {
    const isBrowser =
      typeof window !== 'undefined' && window.localStorage !== undefined;
    return isBrowser;
  }

  // Decodifica el token y devuelve su payload
  private decodeToken(): any {
    if (this.isBrowser() && this.helper) {
      const token = localStorage.getItem(TOKEN_KEY);
      return token ? this.helper.decodeToken(token) : null;
    }
    return null;
  }

  // Inicializa datos del token (username, roles)
  public initializeTokenData(): void {
    if (this.isBrowser()) {
      const decodedToken = this.decodeToken();
      if (decodedToken) {
        const username = decodedToken['username'] || decodedToken['sub'];
        const authorities =
          decodedToken['authorities'] || decodedToken['roles'] || [];
        this.setUserName(username);
        this.setAuthorities(authorities);
      }
    }
  }

  public setToken(token: string): void {
    if (this.isBrowser()) {
      this.limpiarSesionLocal();
      this.accessToken = token;
      this.loggedIn.next(this.isTokenValid());
    }
  }

  public getToken(): string {
    return this.accessToken || '';
  }

  public setUserName(username: string): void {
    if (this.isBrowser()) {
      localStorage.removeItem(USERNAME_KEY);
      localStorage.setItem(USERNAME_KEY, username);
    }
  }

  public getUserName(): string {
    if (this.isBrowser()) {
      return localStorage.getItem(USERNAME_KEY) || '';
    }
    return '';
  }

  public isTokenValid(): boolean {
    const token = this.getToken();
    return !!token && !!this.helper && token.split('.').length === 3 && !this.helper.isTokenExpired(token);
  }

  /** Identificador del usuario autenticado, cuando el backend lo incluye en el JWT. */
  public getUserId(): number | null {
    const decodedToken = this.decodeToken();
    const value = decodedToken?.['userId'] ?? decodedToken?.['usuarioId'] ?? decodedToken?.['id'];
    const id = Number(value);
    return Number.isFinite(id) && id > 0 ? id : null;
  }

  public setAuthorities(authorities: string[]): void {
    if (this.isBrowser()) {
      localStorage.removeItem(AUTHORITIES_KEY);
      localStorage.setItem(AUTHORITIES_KEY, JSON.stringify(authorities));
    }
  }

  public getAuthorities(): string[] {
    if (this.isBrowser()) {
      const roles = localStorage.getItem(AUTHORITIES_KEY);
      try {
        return roles ? JSON.parse(roles) : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  public logOut(): void {
    if (this.isBrowser()) {
      this.limpiarSesionLocal();
      this.loggedIn.next(false);
      this.router.navigateByUrl('/login');
    }
  }

  private checkToken(): void {
    if (this.isBrowser() && this.helper) {
      const token = this.getToken();
      if (!this.isTokenValid()) this.logOut();
      else this.loggedIn.next(true);
    }
  }

  private limpiarSesionLocal(): void {
    this.accessToken = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    localStorage.removeItem(AUTHORITIES_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USERNAME_KEY);
    sessionStorage.removeItem(AUTHORITIES_KEY);
  }

  get isLogged(): Observable<Boolean> {
    return this.loggedIn.asObservable();
  }
}
``;
