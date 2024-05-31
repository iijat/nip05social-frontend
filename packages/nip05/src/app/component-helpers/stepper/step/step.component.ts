import {
  Component,
  EventEmitter,
  Host,
  HostBinding,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { StepperComponent } from '../stepper.component';
import { v4 } from 'uuid';

@Component({
  selector: 'app-step',

  templateUrl: './step.component.html',
  styleUrl: './step.component.scss',
})
export class StepComponent implements OnInit, OnChanges {
  @Input({ required: false }) canNext = true;
  @Input({ required: false }) canPrevious = true;

  @HostBinding('class.step-hidden')
  get isHidden() {
    return !this.isVisible;
  }

  @HostBinding('class.step')
  get isVisible() {
    return this.#isVisible;
  }

  canNextChanged = new EventEmitter<[id: string, canNext: boolean]>();
  canPreviousChanged = new EventEmitter<[id: string, canPrevious: boolean]>();

  readonly uuid = v4();

  #isVisible = false;

  constructor(private parent: StepperComponent) {}

  ngOnInit(): void {
    this.parent.register(this);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['canNext'].currentValue !== changes['canNext'].previousValue) {
      this.canNextChanged.emit([this.uuid, this.canNext]);
    } else if (
      changes['canPrevious'].currentValue !==
      changes['canPrevious'].previousValue
    ) {
      this.canPreviousChanged.emit([this.uuid, this.canPrevious]);
    }
  }

  show() {
    this.#isVisible = true;
  }

  hide() {
    this.#isVisible = false;
  }
}
