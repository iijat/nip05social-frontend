import {
  AfterViewInit,
  Component,
  ContentChildren,
  Input,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
  ViewContainerRef,
} from '@angular/core';
import { StepComponent } from './step/step.component';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.scss',
})
export class StepperComponent implements AfterViewInit {
  @Input({ required: false }) startWithStep = 1;

  steps: StepComponent[] = [];
  selectedStepIndex: number = -1;

  ngAfterViewInit(): void {
    // console.log(this.steps2);
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
}
