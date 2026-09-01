import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';

import { Observable } from 'rxjs';
import { filter, map, shareReplay } from 'rxjs/operators';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { VerticalMenuComponent } from '../vertical-menu/vertical-menu.component';
import { IconComponent } from '../icon/icon.component';

import { TokenService } from '../../../services/token.service';
import { AdministracionService } from '../../../services/administracion.service';
import { UiRefreshService } from '../../../services/ui-refresh.service';
import { LicenseBannerComponent } from '../../license-banner/license-banner.component';

@Component({
    selector: 'app-navigation',
    standalone: true,
    templateUrl: './navigation.component.html',
    styleUrl: './navigation.component.css',
    imports: [
        AsyncPipe,
        RouterOutlet,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        VerticalMenuComponent,
        IconComponent
        ,LicenseBannerComponent
    ]
})
export class NavigationComponent implements OnInit {

    private breakpointObserver = inject(BreakpointObserver);

    isHandset$: Observable<boolean> = this.breakpointObserver
        .observe('(max-width: 991px)')
        .pipe(
            map(result => result.matches),
            shareReplay(1)
        );

    username: string = '';
    roles: string[] = [];
    isHandset = typeof window !== 'undefined' && window.matchMedia('(max-width: 991px)').matches;
    fotoUsuarioSrc: string | null = null;
    temaOscuro = false;

    /**
     * Menú expandido o contraído.
     */
    menuCollapsed = typeof window !== 'undefined' && window.matchMedia('(max-width: 991px)').matches;

    constructor(
        private tokenService: TokenService,
        private router: Router,
        private administracionService: AdministracionService,
        private uiRefresh: UiRefreshService
    ) { }

    ngOnInit(): void {

        this.inicializarTema();

        this.username = this.tokenService.getUserName();
        this.roles = this.tokenService.getAuthorities();
        this.cargarFotoUsuario();
        this.uiRefresh.fotoUsuarioActualizada$.subscribe(() => this.cargarFotoUsuario());

        this.isHandset$
            .subscribe(isHandset => {
                this.isHandset = isHandset;
                this.menuCollapsed = isHandset;
            });

        this.router.events
            .pipe(
                filter((event): event is NavigationEnd => event instanceof NavigationEnd)
            )
            .subscribe(() => {
                if (this.router.url === '/dashboard') this.uiRefresh.actualizarDashboard();
                if (this.isHandset) {
                    this.menuCollapsed = true;
                }
            });

    }

    toggleMenu(): void {

        this.menuCollapsed = !this.menuCollapsed;

    }

    get roleLabel(): string {
        if (!this.roles.length) {
            return 'Usuario';
        }

        return this.roles
            .map(role => role.replace(/^ROLE_/, '').replace(/_/g, ' ').toLowerCase())
            .map(role => role.charAt(0).toUpperCase() + role.slice(1))
            .join(' · ');
    }

    alternarTema(): void {
        this.temaOscuro = !this.temaOscuro;
        this.aplicarTema();
        if (typeof window !== 'undefined') localStorage.setItem('tema', this.temaOscuro ? 'oscuro' : 'claro');
    }

    private cargarFotoUsuario(): void {
        const usuarioId = this.tokenService.getUserId();
        if (!usuarioId) return;
        this.administracionService.obtenerFotoUsuario(usuarioId).subscribe({
            next: blob => this.fotoUsuarioSrc = URL.createObjectURL(blob),
            error: () => this.fotoUsuarioSrc = null
        });
    }

    private inicializarTema(): void {
        if (typeof window === 'undefined') return;
        const guardado = localStorage.getItem('tema');
        this.temaOscuro = guardado ? guardado === 'oscuro' : window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.aplicarTema();
    }

    private aplicarTema(): void {
        if (typeof document !== 'undefined') document.body.classList.toggle('tema-oscuro', this.temaOscuro);
    }

    logout(): void {

        this.tokenService.logOut();

    }

}
