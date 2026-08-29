import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { IconComponent } from "../icon/icon.component";
import { TokenService } from '../../../services/token.service';
import { AdministracionService } from '../../../services/administracion.service';
import { UiRefreshService } from '../../../services/ui-refresh.service';

@Component({
    selector: 'app-vertical-menu',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        MatProgressSpinnerModule,
        IconComponent
    ],
    templateUrl: './vertical-menu.component.html',
    styleUrl: './vertical-menu.component.css'
})
export class VerticalMenuComponent implements OnInit {

    @Input()
    collapsed = false;

    username!: any;
    roles!: any;

    activeMenu: string | null = null;
    logoSrc: string | null = null;

    constructor(
        private tokenService: TokenService,
        private administracionService: AdministracionService,
        private uiRefresh: UiRefreshService
    ) { }

    ngOnInit(): void {

        this.username = this.tokenService.getUserName();
        this.roles = this.tokenService.getAuthorities();

        console.log('Usuario:', this.username);
        console.log('Roles:', this.roles);
        this.cargarLogo();
        this.uiRefresh.logoActualizado$.subscribe(() => this.cargarLogo());

    }

    onOut(): void {

        this.tokenService.logOut();

    }

    toggleMenu(menu: string): void {

        if (this.collapsed) {
            return;
        }

        this.activeMenu =
            this.activeMenu === menu
                ? null
                : menu;

    }

    isMenuOpen(menu: string): boolean {

        if (this.collapsed) {
            return false;
        }

        return this.activeMenu === menu;

    }

    private cargarLogo(): void {
        this.administracionService.obtenerLogo().subscribe({
            next: blob => this.logoSrc = URL.createObjectURL(blob),
            error: () => this.logoSrc = null
        });
    }

    get esAdmin(): boolean {
        return this.roles?.some((rol: string) => rol === 'ADMIN' || rol === 'ROLE_ADMIN');
    }

}
