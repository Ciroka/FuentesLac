import { Component, input, signal, computed } from '@angular/core';
import { DashboardAction } from '../../../models/dashboard.model';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-action-list',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule, MatButtonModule, MatChipsModule],
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

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      default: return 'priority-low';
    }
  }

  getItemClass(priority: string): string {
    switch (priority) {
      case 'high': return 'action-high';
      case 'medium': return 'action-medium';
      default: return 'action-low';
    }
  }

  getIcon(type: string): string {
    return type === 'produce' ? 'apartment' : 'shopping_cart';
  }
}
