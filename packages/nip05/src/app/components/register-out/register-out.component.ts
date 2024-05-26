import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

type DataStep1 = {
  domain: string;
};

type DataStep2 = {
  identifier: string;
};

@Component({
  selector: 'app-register-out',
  templateUrl: './register-out.component.html',
  styleUrl: './register-out.component.scss',
})
export class RegisterOutComponent implements OnInit, OnDestroy {
  dataStep1: DataStep1 | undefined;
  dataStep2: DataStep2 | undefined;
  startWithStep = 1;

  #paramsSubscription: Subscription | undefined;

  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.#paramsSubscription = this.activatedRoute.params.subscribe(
      (params) => {
        const domain = params['domain'];
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
}
