import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stats-block',
  templateUrl: './stats-block.component.html',
  styleUrls: ['./stats-block.component.scss'],
})
export class StatsBlockComponent {
  @Input() name!: string;
  @Input() value: any;
}
