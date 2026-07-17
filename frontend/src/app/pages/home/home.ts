import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
//import { firstValueFrom } from 'rxjs';

//import { AuthService, ProductsService, CategoriesService } from '../../services';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
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