import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-domain-selector',
  templateUrl: './domain-selector.component.html',
  styleUrl: './domain-selector.component.scss',
})
export class DomainSelectorComponent {
  @Input({ required: false }) selectedDomain: string | undefined;
  @Output() selectedDomainChange = new EventEmitter<string>();

  selectDomain(domain: string) {
    this.selectedDomain = domain;
    this.selectedDomainChange.emit(domain);
  }
}
