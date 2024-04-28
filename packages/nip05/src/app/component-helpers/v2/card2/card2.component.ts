import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card2',
  templateUrl: './card2.component.html',
  styleUrl: './card2.component.scss',
})
export class Card2Component {
  @Input({ required: false }) background: 'transparent' | '' = '';
  @Input({ required: false }) border: 'dashed' | 'solid' = 'solid';
}
