import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `<p>Redirecting...</p>`,
})
export class HomePage {
  constructor() {
    inject(Router).navigate(['/home']);
  }
}
