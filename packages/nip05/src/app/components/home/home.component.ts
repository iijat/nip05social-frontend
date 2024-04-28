import { Component, OnInit } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { firstValueFrom } from 'rxjs';
import { ResponsiveService } from '../../services/responsive.service';
import { ErrorHandling } from '../../helpers/error-handling';
import { HelperNostr } from '../../helpers/helper-nostr';
import { IsAuthenticatedQueryRoot } from 'packages/shared/src/lib/graphql/queries-and-mutations/auth';
import { TokenService } from 'packages/shared/src/lib/services/token.service';
import { ToastService } from 'packages/shared/src/lib/services/toast.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  // #region Public Properties

  loading = false;
  reducePubkey = HelperNostr.reducePubkey;
  emailOutBotPubkey =
    'npub16zy56kkwwrhzp9m56px4hx4wj8h69rk7r92ppqcqc3x6h7lpmxeq7cyjuy';
  emailOutBotNip05 = 'email_out@nip05.social';

  // #endregion Public Properties

  // #region Init

  constructor(
    public responsiveService: ResponsiveService,
    private apollo: Apollo,
    private tokenService: TokenService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    //document.body.style.backgroundColor = '#f6af89';
    this.#loadData();
  }

  // #endregion Init

  // #region Private Methods

  async #loadData() {
    this.loading = true;

    try {
      const result = await firstValueFrom(
        this.apollo.query<IsAuthenticatedQueryRoot>({
          query: gql`
            query IsAuthenticated {
              isAuthenticated {
                id
                userId
                deviceId
                token
                validUntil
              }
            }
          `,
          fetchPolicy: 'network-only',
        })
      );

      if (result.data.isAuthenticated) {
        // Set the newly provided token.
        this.tokenService.setToken(result.data.isAuthenticated);
      } else {
        // Unset any expired token that might be cached.
        this.tokenService.unsetToken();
      }
    } catch (error) {
      const message = ErrorHandling.extract(error);
      this.toastService.error(message, 'Error');
    } finally {
      this.loading = false;
    }
  }

  // #endregion Private Methods
}
