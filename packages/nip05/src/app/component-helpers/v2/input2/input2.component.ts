import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-input2',
  templateUrl: './input2.component.html',
  styleUrl: './input2.component.scss',
})
export class Input2Component {
  @Input({ required: true }) model: string | undefined;
  @Output() modelChange = new EventEmitter<string>();
  @Input({ required: false }) placeholder = '';
  @Input({ required: false }) transform: 'uppercase' | 'lowercase' | undefined;
  @Input({ required: false }) showClear = true;
  @Input({ required: false }) confirmClear: string | undefined;
  @Output() valueChange = new EventEmitter<
    [value: string, element: HTMLInputElement]
  >();

  /** Fires when the user presses ESC. */
  @Output() escapeEvent = new EventEmitter<HTMLInputElement>();

  constructor(private alertController: AlertController) {}

  onKeydownEscape(event: Event) {
    this.escapeEvent.emit(event.target as HTMLInputElement);
  }

  onValueChanged(event: Event) {
    let value = (event.target as HTMLInputElement).value;

    if (this.transform === 'uppercase') {
      value = value.toUpperCase();
    } else if (this.transform === 'lowercase') {
      value = value.toLowerCase();
    }

    this.model = value;
    this.modelChange.emit(value);
  }

  onBlur(event: Event) {
    const focusEvent = event as FocusEvent;
    let value = (event.target as HTMLInputElement).value;
    if (this.transform === 'uppercase') {
      value = value.toUpperCase();
    } else if (this.transform === 'lowercase') {
      value = value.toLowerCase();
    }
    this.valueChange.emit([value, event.target as HTMLInputElement]);
  }

  onKeydownEnter(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    let value = (event.target as HTMLInputElement).value;
    if (this.transform === 'uppercase') {
      value = value.toUpperCase();
    } else if (this.transform === 'lowercase') {
      value = value.toLowerCase();
    }

    this.valueChange.emit([value, event.target as HTMLInputElement]);
  }

  async onClickClear(event: Event) {
    const inputElement = event.target as HTMLInputElement;

    if (this.confirmClear) {
      const alert = await this.alertController.create({
        //header: 'Please confirm',
        subHeader: this.confirmClear,
        //message: this.confirmClear,
        buttons: [
          'Cancel',
          {
            text: 'Ok',
            handler: () => {
              inputElement.value = '';
              this.model = '';
              this.modelChange.emit('');
              this.valueChange.emit(['', inputElement]);
            },
          },
        ],
      });

      await alert.present();
    } else {
      inputElement.value = '';
      this.model = '';
      this.modelChange.emit('');
      this.valueChange.emit(['', inputElement]);
    }
  }
}
