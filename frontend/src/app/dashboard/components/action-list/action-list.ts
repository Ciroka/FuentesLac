import { Component, input, signal, computed } from '@angular/core';
import { DashboardAction } from '../../../models/dashboard.model';

@Component({
  selector: 'app-action-list',
  standalone: true,
  templateUrl: './action-list.html',
  styleUrl: './action-list.scss',
})
export class ActionList {
  actions = input.required<DashboardAction[]>();

  private readonly MAX_VISIBLE = 8;
  showAll = signal(false);

  hasOverflow = computed(() => this.actions().length > this.MAX_VISIBLE);

  visibleActions = computed(() =>
    this.showAll() ? this.actions() : this.actions().slice(0, this.MAX_VISIBLE)
  );

  toggle(): void {
    this.showAll.update(v => !v);
  }
}
