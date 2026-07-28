import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  templateUrl: './kpi-card.html',
  styleUrl: './kpi-card.scss',
})
export class KpiCard {
  label = input.required<string>();
  value = input.required<string>();
  suffix = input<string>();
  delta = input<number>();
  deltaLabel = input<string>();
  valueClass = input<string>();
  icon = input<string>();
  ariaLabel = input<string>();
  noActivity = input<boolean>(false);
}
