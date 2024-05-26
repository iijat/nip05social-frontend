import { Component, Host, HostBinding, OnInit } from '@angular/core';
import { StepperComponent } from '../stepper.component';
import { v4 } from 'uuid';

@Component({
  selector: 'app-step',

  templateUrl: './step.component.html',
  styleUrl: './step.component.scss',
})
export class StepComponent implements OnInit {
  @HostBinding('class.step-hidden')
  get isHidden() {
    return !this.isVisible;
  }

  @HostBinding('class.step')
  get isVisible() {
    return this.#isVisible;
  }

  readonly uuid = v4();

  #isVisible = false;

  constructor(private parent: StepperComponent) {}

  ngOnInit(): void {
    this.parent.register(this);
  }

  show() {
    this.#isVisible = true;
  }

  hide() {
    this.#isVisible = false;
  }
}
