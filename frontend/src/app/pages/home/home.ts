import { Component, OnDestroy, OnInit, signal } from '@angular/core';
@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomePage implements OnInit, OnDestroy {
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