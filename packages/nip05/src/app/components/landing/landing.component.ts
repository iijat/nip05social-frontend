import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import * as uuid from 'uuid';
import { LocalStorageService } from '../../services/local-storage.service';
import { ResponsiveService } from '../../services/responsive.service';
import { ToastService } from 'packages/shared/src/lib/services/toast.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent implements OnInit {
  // #region Init

  constructor(
    private _bpObserver: BreakpointObserver,
    private _localStorageService: LocalStorageService,
    public responsiveService: ResponsiveService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this._bpObserver
      .observe([
        Breakpoints.XSmall,
        Breakpoints.Small,
        Breakpoints.Medium,
        Breakpoints.Large,
      ])
      .subscribe((result) => {
        const breakpoints = result.breakpoints;

        if (breakpoints[Breakpoints.XSmall]) {
          this.responsiveService.set(true);
          this.toastService.setIsHandset(true);
        } else if (breakpoints[Breakpoints.Small]) {
          this.responsiveService.set(false);
          this.toastService.setIsHandset(false);
          console.log('Small');
        } else if (breakpoints[Breakpoints.Medium]) {
          this.responsiveService.set(false);
          this.toastService.setIsHandset(false);
          console.log('Medium');
        } else if (breakpoints[Breakpoints.Large]) {
          this.responsiveService.set(false);
          this.toastService.setIsHandset(false);
          console.log('Large');
        }
      });

    // Make sure that the deviceId is set in localStorage
    const deviceId = this._localStorageService.readDeviceId();
    if (!deviceId) {
      this._localStorageService.storeDeviceId(uuid.v4());
    }
  }

  // #endregion Init
}
