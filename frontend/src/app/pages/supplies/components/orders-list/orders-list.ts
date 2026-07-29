import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Order } from '../../../../models/order.model';
import { OrderCard } from '../order-card/order-card';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, OrderCard],
  templateUrl: './orders-list.html',
  styleUrl: './orders-list.scss',
})
export class OrdersList {
  orders = input.required<Order[]>();
  changed = output<void>();
}
