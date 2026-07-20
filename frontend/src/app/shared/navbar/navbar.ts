import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit, OnDestroy {
    currentTime = signal(this.formatDate(new Date()));
  private intervalId: ReturnType<typeof setInterval> | undefined;

  ngOnInit() {
    this.intervalId = setInterval(() => {
      this.currentTime.set(this.formatDate(new Date()));
    }, 1000); // se actualiza cada 1 segundo
  }

  ngOnDestroy() {
    clearInterval(this.intervalId); // corta el interval
  }

  private formatDate(date: Date): string {
    return date.toLocaleString('es-AR'); // formato fecha
  } 
}
