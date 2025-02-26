import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {
  isLoading =signal<boolean>(false)
  constructor() { }
  show() {
    this.isLoading.set(true);
  }
  hide() {
    this.isLoading.set(false);
  }
}
