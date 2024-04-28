import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer2',
  templateUrl: './footer2.component.html',
  styleUrl: './footer2.component.scss',
})
export class Footer2Component {
  readonly year = new Date().getFullYear();
}
