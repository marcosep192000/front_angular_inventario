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

    /**
     * Menú expandido o contraído.
     */
    menuCollapsed = false;

    constructor(
        private tokenService: TokenService,
        private router: Router
    ) { }

    ngOnInit(): void {

        this.username = this.tokenService.getUserName();
        this.roles = this.tokenService.getAuthorities();

        this.updateMenuState(this.router.url);

   this.router.events
    .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    )
    .subscribe(event => {

        this.updateMenuState(event.urlAfterRedirects);

    });

    }

    private updateMenuState(url: string): void {

        this.menuCollapsed =

            url.includes('/dashboard/new-sale') ||

            url.includes('/dashboard/cash-closing');

    }

    expandMenu(): void {

        this.menuCollapsed = false;

    }

    collapseMenu(): void {

        if (!this.isDesktop()) {
            return;
        }

        this.menuCollapsed = true;

    }

    toggleMenu(): void {

        this.menuCollapsed = !this.menuCollapsed;

    }

    private isDesktop(): boolean {

        return window.innerWidth >= 992;

    }

    logout(): void {

        this.tokenService.logOut();

    }

}
