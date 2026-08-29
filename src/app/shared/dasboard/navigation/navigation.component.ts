import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

import { Observable } from 'rxjs';
import { filter, map, shareReplay } from 'rxjs/operators';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { VerticalMenuComponent } from '../vertical-menu/vertical-menu.component';
import { IconComponent } from '../icon/icon.component';

import { TokenService } from '../../../services/token.service';
import { AdministracionService } from '../../../services/administracion.service';
import { UiRefreshService } from '../../../services/ui-refresh.service';

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
        VerticalMenuComponent,
        IconComponent
    ]
})
export class NavigationComponent implements OnInit {

    private breakpointObserver = inject(BreakpointObserver);

    isHandset$: Observable<boolean> = this.breakpointObserver
        .observe(Breakpoints.Handset)
        .pipe(
            map(result => result.matches),
            shareReplay(1)
        );

    username: string = '';
    roles: string[] = [];
    isHandset = false;
    fotoUsuarioSrc: string | null = null;

    /**
     * Menú expandido o contraído.
     */
    menuCollapsed = false;

    constructor(
        private tokenService: TokenService,
        private router: Router,
        private administracionService: AdministracionService,
        private uiRefresh: UiRefreshService
    ) { }

    ngOnInit(): void {

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

    private cargarFotoUsuario(): void {
        const usuarioId = this.tokenService.getUserId();
        if (!usuarioId) return;
        this.administracionService.obtenerFotoUsuario(usuarioId).subscribe({
            next: blob => this.fotoUsuarioSrc = URL.createObjectURL(blob),
            error: () => this.fotoUsuarioSrc = null
        });
    }

    logout(): void {

        this.tokenService.logOut();

    }

}
