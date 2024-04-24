import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from '../../services/local-storage.service';
import { firstValueFrom } from 'rxjs';
import { Apollo, gql } from 'apollo-angular';
import { CatchError } from 'shared';
import { ResponsiveService } from '../../services/responsive.service';
import { sleep } from 'shared';
import {
  RedeemLoginCodeMutationArgs,
  RedeemLoginCodeMutationRoot,
} from 'packages/shared/src/lib/graphql/crud/login';
import { TokenService } from 'packages/shared/src/lib/services/token.service';
import { ToastService } from 'packages/shared/src/lib/services/toast.service';

@Component({
  selector: 'app-alogin',
  templateUrl: './alogin.component.html',
  styleUrls: ['./alogin.component.scss'],
})
export class AloginComponent implements OnInit {
  // #region Public Properties

  userId: string | undefined | null;
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
    this.code = this._activatedRoute.snapshot.paramMap.get('code');

    this.redeemLoginCode();
  }

  // #endregion Init

  // #region Public Methods

  getPart(code: string | undefined | null, index: number) {
    if (typeof code === 'undefined' || !code) {
      return '';
    }

    return code[index];
  }

  async redeemLoginCode() {
    if (!this.userId || !this.code) {
      return;
    }

    this.activity = true;

    await sleep(1000);

    try {
      const variables: RedeemLoginCodeMutationArgs = {
        userId: this.userId ?? '',
        deviceId: this._localStorageService.readDeviceId() ?? '',
        code: this.code ?? '',
      };

      const result = await firstValueFrom(
        this._apollo.mutate<RedeemLoginCodeMutationRoot>({
          mutation: gql`
            mutation RedeemLoginCode(
              $userId: String!
              $deviceId: String!
              $code: String!
            ) {
              redeemLoginCode(
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

      this._tokenService.setToken(result.data?.redeemLoginCode);
      this._router.navigate(['s/home']);
    } catch (error) {
      const message = new CatchError(error).message;
      this._toastService.error(message, 'Error');
    } finally {
      this.activity = false;
    }
  }

  // #endregion Public Methods
}
