import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-forgot-password',
  imports: [
    FormsModule, RouterLink, MatCard, MatCardContent, MatFormField, MatLabel, MatPrefix,
    MatInput, MatIcon, MatButton, MatProgressSpinner
  ],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPasswordPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  loading = signal(false);

  submit(): void {
    if (!this.email) return;

    this.loading.set(true);
    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.loading.set(false);
        toast.success('Si el email existe, vas a recibir un código por correo.');
        this.router.navigate(['/reset-password'], { queryParams: { email: this.email } });
      },
      error: () => {
        this.loading.set(false);
        toast.error('No se pudo procesar la solicitud. Intentá de nuevo.');
      },
    });
  }
}
