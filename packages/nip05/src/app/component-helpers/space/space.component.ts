import { Component, Input } from '@angular/core';

enum SpaceSize {
  small = 'small',
  normal = 'normal',
  large = 'large',
  tiny = 'tiny',
}

@Component({
  selector: 'app-space',
  templateUrl: './space.component.html',
  styleUrls: ['./space.component.scss'],
})
export class SpaceComponent {
  @Input() size: string | undefined;

  get className(): string {
    if (typeof this.size === 'undefined') {
      return SpaceSize.normal;
    }

    switch (this.size) {
      case SpaceSize.large:
        return SpaceSize.large;

      case SpaceSize.small:
        return SpaceSize.small;

      case SpaceSize.tiny:
        return SpaceSize.tiny;

      default:
        return SpaceSize.normal;
    }
  }
}
