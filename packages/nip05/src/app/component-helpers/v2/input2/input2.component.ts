import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-input2',
  templateUrl: './input2.component.html',
  styleUrl: './input2.component.scss',
})
export class Input2Component {
  @Input({ required: false }) placeholder = '';
}
