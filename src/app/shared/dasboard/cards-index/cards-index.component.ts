import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from "@angular/router";


@Component({
  selector: 'app-cards-index',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cards-index.component.html',
  styleUrl: './cards-index.component.css',

})
export class CardsIndexComponent {

constructor(private router: Router) {}

irABajoStock() {
  this.router.navigate(['bajo-stock']);
  console.log (  this.router.navigate(['dashboard','/bajo-stock']))
}
}

