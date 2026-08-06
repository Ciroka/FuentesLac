import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-legal',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './legal.html',
  styleUrl: './legal.scss',
})
export class Legal {
  private readonly authService = inject(AuthService);

  /** A dónde vuelve el link superior: al panel si hay sesión, al login si no. */
  readonly volverA = this.authService.isLoggedIn() ? '/home' : '/login';
}
