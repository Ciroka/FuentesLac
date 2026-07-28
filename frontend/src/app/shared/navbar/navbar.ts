import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, MatIconModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit, OnDestroy {
  private authService = inject(AuthService);

  currentTime = signal(this.formatDate(new Date()));
  userName = signal('');
  userRole = signal('');
  private intervalId: ReturnType<typeof setInterval> | undefined;

  ngOnInit() {
    this.intervalId = setInterval(() => {
      this.currentTime.set(this.formatDate(new Date()));
    }, 1000);

    const user = this.authService.getUser();
    if (user) {
      this.userName.set(user.email);
      this.userRole.set(user.role);
    }
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  logout(): void {
    this.authService.logout();
  }

  private formatDate(date: Date): string {
    return date.toLocaleString('es-AR');
  }
}
