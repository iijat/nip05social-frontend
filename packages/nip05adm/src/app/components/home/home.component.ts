import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Apollo, gql } from 'apollo-angular';
import { IsAuthenticatedQueryRoot } from 'packages/shared/src/lib/graphql/queries-and-mutations/auth';
import { ToastService } from 'packages/shared/src/lib/services/toast.service';
import { TokenService } from 'packages/shared/src/lib/services/token.service';
import { firstValueFrom } from 'rxjs';
import { CatchError } from 'shared';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  loading = false;

  constructor(
    private tokenService: TokenService,
    private apollo: Apollo,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.#loadData();
  }

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
        this.router.navigateByUrl('/login');
      }
    } catch (error) {
      this.toastService.error(new CatchError(error).message, 'Error');
    } finally {
      this.loading = false;
    }
  }
}
