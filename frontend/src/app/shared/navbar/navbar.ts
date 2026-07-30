import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
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
  private themeService = inject(ThemeService);

  currentTime = signal(this.formatDate(new Date()));
  userName = computed(() => this.authService.currentUser()?.email ?? '');
  userRole = computed(() => this.authService.currentUser()?.role ?? '');
  isAdmin = this.authService.isAdmin;
  isDarkTheme = computed(() => this.themeService.theme() === 'dark');
  mobileMenuOpen = signal(false);
  private intervalId: ReturnType<typeof setInterval> | undefined;

  ngOnInit() {
    this.intervalId = setInterval(() => {
      this.currentTime.set(this.formatDate(new Date()));
    }, 1000);
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  logout(): void {
    this.authService.logout();
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(open => !open);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  private formatDate(date: Date): string {
    return date.toLocaleString('es-AR');
  }
}
