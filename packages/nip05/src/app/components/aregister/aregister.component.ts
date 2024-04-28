import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from '../../services/local-storage.service';
import { Apollo, gql } from 'apollo-angular';
import { ResponsiveService } from '../../services/responsive.service';
import { CatchError, sleep } from 'shared';
import { firstValueFrom } from 'rxjs';
import {
  RedeemRegistrationCodeMutationArgs,
  RedeemRegistrationCodeMutationRoot,
} from 'packages/shared/src/lib/graphql/crud/registration';
import { TokenService } from 'packages/shared/src/lib/services/token.service';
import { ToastService } from 'packages/shared/src/lib/services/toast.service';

@Component({
  selector: 'app-aregister',
  templateUrl: './aregister.component.html',
  styleUrls: ['./aregister.component.scss'],
})
export class AregisterComponent {
  // #region Public Properties

  userId: string | undefined | null;
  registrationId: string | undefined | null;
  code: string | undefined | null;

  activity = false;

  // #endregion Public Properties

  // #region Init

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _localStorageService: LocalStorageService,
    private _apollo: Apollo,
    private _tokenService: TokenService,
    private _router: Router,
    private _toastService: ToastService,
    public responsiveService: ResponsiveService
  ) {}

  ngOnInit(): void {
    this.userId = this._activatedRoute.snapshot.paramMap.get('userId');
    this.registrationId =
      this._activatedRoute.snapshot.paramMap.get('registrationId');
    this.code = this._activatedRoute.snapshot.paramMap.get('code');

    this._redeemRegistrationCode();
  }

  // #endregion Init

  // #region Public Methods

  getPart(code: string | undefined | null, index: number) {
    if (typeof code === 'undefined' || !code) {
      return '';
    }

    return code[index];
  }

  // #endregion Public Methods

  // #region Private Methods

  private async _redeemRegistrationCode() {
    if (!this.userId || !this.code || !this.registrationId) {
      return;
    }

    this.activity = true;

    await sleep(1000);

    try {
      const variables: RedeemRegistrationCodeMutationArgs = {
        registrationId: this.registrationId,
        userId: this.userId,
        deviceId: this._localStorageService.readDeviceId() ?? '',
        code: this.code,
      };

      const result = await firstValueFrom(
        this._apollo.mutate<RedeemRegistrationCodeMutationRoot>({
          mutation: gql`
            mutation RedeemRegistrationCode(
              $registrationId: String!
              $userId: String!
              $deviceId: String!
              $code: String!
            ) {
              redeemRegistrationCode(
                registrationId: $registrationId
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

      this._tokenService.setToken(result.data?.redeemRegistrationCode);
      this._router.navigate(['s/home']);
    } catch (error) {
      const message = new CatchError(error).message;
      this._toastService.error(message, 'Error');
    } finally {
      this.activity = false;
    }
  }

  // #endregion Private Methods
}
