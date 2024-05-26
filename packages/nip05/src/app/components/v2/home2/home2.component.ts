import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Apollo, gql } from 'apollo-angular';
import { HomeStatsQueryRoot } from 'packages/shared/src/lib/graphql/crud/home2-resolver';
import { HomeStatsOutput } from 'packages/shared/src/lib/graphql/output/home-stats-output';
import { IsAuthenticatedQueryRoot } from 'packages/shared/src/lib/graphql/queries-and-mutations/auth';
import { ToastService } from 'packages/shared/src/lib/services/toast.service';
import { TokenService } from 'packages/shared/src/lib/services/token.service';
import { firstValueFrom } from 'rxjs';
import { CatchError } from 'shared';

@Component({
  selector: 'app-home2',
  templateUrl: './home2.component.html',
  styleUrl: './home2.component.scss',
})
export class Home2Component implements OnInit {
  selectedDomain: string = 'nip05.social';
  activityQueryStats = false;
  homeStats: HomeStatsOutput | undefined;

  ngOnInit(): void {
    this.#loadData();
  }

  constructor(
    private apollo: Apollo,
    private tokenService: TokenService,
    private toastService: ToastService,
    private router: Router
  ) {}

  async onClickStat() {
    await this.router.navigateByUrl('/stats');
  }

  onClickRegister() {
    this.router.navigateByUrl(`/register-out/${this.selectedDomain}`);
  }

  async #loadData() {
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

      const statsResult = await firstValueFrom(
        this.apollo.query<HomeStatsQueryRoot>({
          query: gql`
            query HomeStats {
              homeStats {
                users
                lookups
              }
            }
          `,
        })
      );

      this.homeStats = statsResult.data.homeStats;
    } catch (error) {
      // this.toastService.error(new CatchError(error).message);
      // Do not show error message to the user.
      // Just "do nothing".
      console.log(error);
    } finally {
      this.activityQueryStats = false;
    }
  }
}
