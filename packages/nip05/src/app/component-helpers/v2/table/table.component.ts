import { Component, Input } from '@angular/core';
import { TableHeader, TableItem } from './table.common';
import { v4 } from 'uuid';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent {
  @Input({ required: true }) headers: TableHeader[] = [];
  @Input({ required: true })
  get data(): any[] {
    return this.#data;
  }
  set data(value) {
    this.#data = value;
    this.#buildItems(value);
  }

  #data: any[] = [];

  items: TableItem[] = [];

  #buildItems(data: any[]) {
    this.items = data.map((x) => ({
      id: v4(),
      isSelected: false,
      data: x,
    }));
  }
}
