import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-menu-button2',
  templateUrl: './menu-button2.component.html',
  styleUrl: './menu-button2.component.scss',
})
export class MenuButton2Component {
  @Input({ required: false }) icon: string | undefined;
  @Input({ required: false }) align: 'start' | 'center' | 'end' = 'center';
  @Input({ required: false }) fill: 'clear' | 'solid' | 'solid-custom' =
    'clear';
  @Input({ required: false }) customColor: string | undefined;
  @Input({ required: false }) customBackgroundColor: string | undefined;
}
