import { Component } from '@angular/core';
import { Navbar } from '../../shared/navbar/navbar';

@Component({
  selector: 'app-products',
  imports: [Navbar],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products {}
