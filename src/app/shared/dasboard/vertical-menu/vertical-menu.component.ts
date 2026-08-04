import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { IconComponent } from "../icon/icon.component";
import { TokenService } from '../../../services/token.service';

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

    constructor(
        private tokenService: TokenService
    ) { }

    ngOnInit(): void {

        this.username = this.tokenService.getUserName();
        this.roles = this.tokenService.getAuthorities();

        console.log('Usuario:', this.username);
        console.log('Roles:', this.roles);

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

}
