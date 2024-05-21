import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, firstValueFrom } from 'rxjs';
import { RouteParamsService } from '../../../services/route-params-service';
import { LoginViaDmOutput } from 'packages/shared/src/lib/graphql/output/login-via-dm-output';
import { Location } from '@angular/common';
import { ToastService } from 'packages/shared/src/lib/services/toast.service';
import { CatchError } from 'shared';
import {
  LoginViaDmMutationRoot,
  LoginViaDmRedeemMutationArgs,
  LoginViaDmRedeemMutationRoot,
} from 'packages/shared/src/lib/graphql/crud/login';
import { LocalStorageService } from '../../../services/local-storage.service';
import { Apollo, gql } from 'apollo-angular';
import { TokenService } from 'packages/shared/src/lib/services/token.service';
import { PinInputComponent } from '../../../component-helpers/v2/pin-input/pin-input.component';

@Component({
  selector: 'app-login-via-dm',
  templateUrl: './login-via-dm.component.html',
  styleUrl: './login-via-dm.component.scss',
})
export class LoginViaDmComponent implements OnInit, OnDestroy {
  loginViaDm: LoginViaDmOutput | undefined;
  activity = false;

  @ViewChild('pinInput') pinInput: PinInputComponent | undefined;

  #paramsSubscription: Subscription | undefined;

  constructor(
    private activatedRoute: ActivatedRoute,
    private routeParamsService: RouteParamsService,
    private router: Router,
    private location: Location,
    private toastService: ToastService,
    private localStorageService: LocalStorageService,
    private apollo: Apollo,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.#paramsSubscription = this.activatedRoute.params.subscribe(
      (params) => {
        const key = params['key'];
        this.loginViaDm = this.routeParamsService.safe.get(key) as
          | LoginViaDmOutput
          | undefined;

        if (!this.loginViaDm) {
          //this.router.navigateByUrl('/login');
          return;
        }

        this.loginViaDm.relays = this.loginViaDm.relays.map((x) =>
          x.replace('wss://', '')
        );
      }
    );
  }

  ngOnDestroy(): void {
    this.#paramsSubscription?.unsubscribe();
  }

  navigateBack() {
    this.location.back();
  }

  async onPinEntered(pin: string) {
    if (this.activity || !this.loginViaDm) {
      return;
    }

    this.activity = true;
    try {
      const variables: LoginViaDmRedeemMutationArgs = {
        userId: this.loginViaDm.userId,
        deviceId: this.localStorageService.readDeviceId() ?? '',
        code: pin,
      };

      const result = await firstValueFrom(
        this.apollo.mutate<LoginViaDmRedeemMutationRoot>({
          mutation: gql`
            mutation LoginViaDmRedeem(
              $userId: String!
              $deviceId: String!
              $code: String!
            ) {
              loginViaDmRedeem(
                userId: $userId
                deviceId: $deviceId
                code: $code
              ) {
                id
                userId
                deviceId
                token
                validUntil
              }
            }
          `,
          variables,
          fetchPolicy: 'network-only',
        })
      );
      this.tokenService.setToken(result.data?.loginViaDmRedeem);
      this.router.navigateByUrl('/s/account');
    } catch (error) {
      this.toastService.error(new CatchError(error).message);
      this.pinInput?.clearInput();
    } finally {
      this.activity = false;
    }
  }
}
