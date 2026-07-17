import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
//import { firstValueFrom } from 'rxjs';

//import { AuthService, ToastService } from '../../services';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginPage {
  //private authService = inject(AuthService);
  //private toastService = inject(ToastService);

  email = '';
  password = '';
  error = '';
  loading = signal(false);
  showPassword = signal(false);

  async submit(): Promise<void> {
    this.error = '';
    this.loading.set(true);
    /*try {
      await firstValueFrom(this.authService.login({ email: this.email, password: this.password }));
      this.router.navigate(['/']);
    } catch (err: any) {
      this.error = 'Error al iniciar sesión';
      this.mostrarMsjError();
    } finally {
      this.loading.set(false);
    }*/
  }

  mostrarMsjError(): void {
    //this.toastService.error({ message: this.error });
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }
}