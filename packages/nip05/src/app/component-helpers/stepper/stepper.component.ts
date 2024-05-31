import { Component, Input, OnDestroy } from '@angular/core';
import { StepComponent } from './step/step.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.scss',
})
export class StepperComponent implements OnDestroy {
  @Input({ required: false }) startWithStep = 1;

  steps: StepComponent[] = [];
  selectedStepIndex: number = -1;
  stepCanNext: Map<number, boolean> = new Map();
  stepCanPrevious: Map<number, boolean> = new Map();

  #canNextSubscriptions: Subscription[] = [];
  #canPreviousSubscriptions: Subscription[] = [];

  ngOnDestroy(): void {
    this.#canNextSubscriptions.forEach((x) => x.unsubscribe());
    this.#canPreviousSubscriptions.forEach((x) => x.unsubscribe());
  }

  onClickPreviousStep() {
    if (this.selectedStepIndex > 0) {
      this.selectedStepIndex--;
      this.selectStep(this.selectedStepIndex);
    }
  }

  onClickNextStep() {
    if (this.selectedStepIndex < this.steps.length - 1) {
      this.selectedStepIndex++;
      this.selectStep(this.selectedStepIndex);
    }
  }

  register(step: StepComponent) {
    this.steps.push(step);
    if (this.steps.length === this.startWithStep) {
      this.selectedStepIndex = this.startWithStep - 1;
      this.selectStep(this.startWithStep - 1);
    }

    this.stepCanNext.set(this.steps.length - 1, step.canNext);
    this.stepCanPrevious.set(this.steps.length - 1, step.canPrevious);

    const nextSubscription = step.canNextChanged.subscribe(
      this.#canNextHasChanged.bind(this)
    );
    this.#canNextSubscriptions.push(nextSubscription);

    const previousSubscription = step.canPreviousChanged.subscribe(
      this.#canPreviousHasChanged.bind(this)
    );
  }

  selectStep(index: number) {
    this.selectedStepIndex = index;

    for (let i = 0; i < this.steps.length; i++) {
      if (i === index) {
        this.steps[i].show();
      } else {
        this.steps[i].hide();
      }
    }
  }

  #canNextHasChanged(value: [id: string, canNext: boolean]) {
    const index = this.steps.findIndex((x) => x.uuid === value[0]);
    if (index !== -1) {
      this.stepCanNext.set(index, value[1]);
    }
  }

  #canPreviousHasChanged(value: [id: string, canPrevious: boolean]) {
    const index = this.steps.findIndex((x) => x.uuid === value[0]);
    if (index !== -1) {
      this.stepCanPrevious.set(index, value[1]);
    }
  }
}
