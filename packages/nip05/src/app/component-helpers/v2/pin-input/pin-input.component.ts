import {
  Component,
  Input,
  OnInit,
  AfterViewInit,
  Output,
  EventEmitter,
} from '@angular/core';

@Component({
  selector: 'app-pin-input',
  templateUrl: './pin-input.component.html',
  styleUrl: './pin-input.component.scss',
})
export class PinInputComponent implements OnInit, AfterViewInit {
  @Input({ required: true }) length!: number;
  @Output() entered = new EventEmitter<string>();

  codes = new Map<number, string>();
  items: string[] = [];

  ngOnInit(): void {
    for (let i = 0; i < this.length; i++) {
      this.codes.set(i, '-1');
      this.items.push(i.toString());
    }
  }

  ngAfterViewInit(): void {
    document.getElementById('input-0')?.focus();
  }

  clearInput() {
    for (let i = 0; i < this.length; i++) {
      const input = document.getElementById('input-' + i) as HTMLInputElement;
      input.value = '';
      this.codes.set(i, '-1');
    }
  }

  onFocus(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    inputElement.select();
  }

  onInput(event: Event, index: number) {
    const inputElement = event.target as HTMLInputElement;
    this.codes.set(index, inputElement.value);

    if (Array.from(this.codes.values()).every((x) => x !== '-1')) {
      this.entered.emit(Array.from(this.codes.values()).join(''));
    } else {
      document.getElementById('input-' + (index + 1))?.focus();
    }
  }

  onBackspace(event: Event, currentIndex: number) {
    event.preventDefault();

    if (currentIndex === 0) {
      return;
    }

    const previousInput = document.getElementById(
      'input-' + (currentIndex - 1)
    ) as HTMLInputElement;
    previousInput.focus();
    previousInput.select();
  }
}
