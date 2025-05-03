import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { IconComponent } from "../icon/icon.component";
import { TokenService } from '../../../services/token.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-vertical-menu',
  standalone: true,
  imports: [CommonModule,RouterLink,MatProgressSpinnerModule,IconComponent],
  templateUrl: './vertical-menu.component.html',
  styleUrl: './vertical-menu.component.css',
})
export class VerticalMenuComponent implements OnInit {
  username!: any;
  roles!: any;
  constructor(private tokenService: TokenService) {}
  ngOnInit(): void {
    this.username = this.tokenService.getUserName();
    this.roles = this.tokenService.getAuthorities();
    console.log('Usuario:', this.username);
    console.log('Roles:', this.roles);
  }

  onOut(): void {
    this.tokenService.logOut();
  }

  activeMenu: string | null = null;

  toggleMenu(menu: string) {
    this.activeMenu = this.activeMenu === menu ? null : menu;
  }

  isMenuOpen(menu: string): boolean {
    return this.activeMenu === menu;
  }
}

