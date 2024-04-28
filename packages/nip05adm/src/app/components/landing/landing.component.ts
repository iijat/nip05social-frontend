import { Component, OnInit } from '@angular/core';
import { ADM_LOCAL_STORAGE } from '../../common/local-storage';
import { v4 } from 'uuid';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent implements OnInit {
  ngOnInit(): void {
    this.#assureDeviceId();
  }

  #assureDeviceId() {
    const deviceId = localStorage.getItem(ADM_LOCAL_STORAGE.DEVICE_ID);
    if (!deviceId) {
      localStorage.setItem(ADM_LOCAL_STORAGE.DEVICE_ID, v4());
    }
  }
}
