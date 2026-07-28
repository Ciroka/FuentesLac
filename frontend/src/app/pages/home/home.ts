import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  template: ``,
})
export class HomePage {
  constructor() {
    inject(Router).navigate(['/home']);
  }
}
