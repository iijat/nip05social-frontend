import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button2',
  templateUrl: './button2.component.html',
  styleUrl: './button2.component.scss',
})
export class Button2Component {
  @Input({ required: false }) disabled = false;
  @Input({ required: false }) fill: 'clear' | 'outline' | 'solid' = 'solid';
  @Input({ required: false }) color: 'primary' | 'secondary' | 'tertiary' =
    'primary';
  @Input({ required: false }) activity = false;
}
