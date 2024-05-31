import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { OpenApiService } from '../../services/open-api-service';
import { ToastService } from 'packages/shared/src/lib/services/toast.service';
import { TokenService } from 'packages/shared/src/lib/services/token.service';

type DataStep1 = {
  domain?: string;
};

type DataStep2 = {
  identifier: string;
  isAvailable?: boolean;
  reason?: string | null;
};

@Component({
  selector: 'app-register-out',
  templateUrl: './register-out.component.html',
  styleUrl: './register-out.component.scss',
})
export class RegisterOutComponent implements OnInit, OnDestroy {
  activity = false;

  dataStep1: DataStep1 = {};
  dataStep2: DataStep2 = { identifier: '' };
  startWithStep = 1;

  #paramsSubscription: Subscription | undefined;

  constructor(
    private activatedRoute: ActivatedRoute,
    private openApiService: OpenApiService,
    private toastService: ToastService,
    public tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.#paramsSubscription = this.activatedRoute.params.subscribe(
      (params) => {
        const domain = params['domain'];

        if (domain === 'undefined') {
          // Do nothing, start with step 1.
          return;
        }

        if (domain) {
          this.dataStep1 = { domain };
          this.startWithStep = 2;
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.#paramsSubscription?.unsubscribe();
  }

  async onClickCheckAvailability() {
    const nostrAddress =
      this.dataStep2.identifier + '@' + this.dataStep1.domain;

    this.activity = true;
    const result = await this.openApiService.client.GET(
      '/check/is-available/{id}',
      {
        params: {
          path: {
            id: nostrAddress,
          },
        },
      }
    );
    this.activity = false;

    if (result.error) {
      this.toastService.error(result.error.message ?? 'An error occurred');
      return;
    }

    this.dataStep2.isAvailable = result.data.isAvailable;
    if (result.data.isAvailable) {
      this.dataStep2.reason = 'AVAILABLE';
    } else {
      this.dataStep2.reason = result.data.reason;
    }
  }
}
