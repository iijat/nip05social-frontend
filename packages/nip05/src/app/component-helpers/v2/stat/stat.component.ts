import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat',
  templateUrl: './stat.component.html',
  styleUrl: './stat.component.scss',
})
export class StatComponent {
  @Input({ required: true }) icon = 'ph-users-three';
  @Input({ required: true }) value!: string;

  @Input({ required: false }) valueFontSize: string | undefined;
  @Input({ required: false }) backgroundColor = 'orange';
  @Input({ required: false }) text: string | undefined;
}
