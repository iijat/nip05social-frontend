import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from '../../../services/local-storage.service';
import { v4 } from 'uuid';

@Component({
  selector: 'app-landing2',
  templateUrl: './landing2.component.html',
  styleUrl: './landing2.component.scss',
})
export class Landing2Component implements OnInit {
  constructor(private localStorageService: LocalStorageService) {}

  ngOnInit(): void {
    window.addEventListener('resize', this.#documentHeight);

    // Make sure that the deviceId is set in localStorage
    const deviceId = this.localStorageService.readDeviceId();
    if (!deviceId) {
      this.localStorageService.storeDeviceId(v4());
    }
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      event.target.complete();
      window.location.reload();
    }, 200);
  }

  #documentHeight() {
    const doc = document.documentElement;
    doc.style.setProperty('--doc-height', `${window.innerHeight}px`);
  }
}
