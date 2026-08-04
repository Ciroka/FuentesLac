import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatError, MatFormField, MatLabel, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-reset-password',
  imports: [
    FormsModule, RouterLink, MatCard, MatCardContent, MatFormField, MatLabel, MatPrefix, MatSuffix,
    MatError, MatInput, MatIcon, MatButton, MatProgressSpinner, MatButtonModule
  ],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPasswordPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  email = this.route.snapshot.queryParamMap.get('email') ?? '';
  code = '';
  newPassword = '';
  confirmPassword = '';
  showPassword = signal(false);
  loading = signal(false);

  get passwordsMismatch(): boolean {
    return this.confirmPassword.length > 0 && this.newPassword !== this.confirmPassword;
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  submit(): void {
    if (this.passwordsMismatch || this.newPassword.length < 8 || !this.code) return;

    this.loading.set(true);
    this.authService.resetPassword(this.code, this.newPassword).subscribe({
      next: () => {
        this.loading.set(false);
        toast.success('Contraseña actualizada. Ya podés iniciar sesión.');
        this.router.navigate(['/login']);
      },
      error: () => {
        this.loading.set(false);
        toast.error('Código inválido o expirado.');
      },
    });
  }
}
