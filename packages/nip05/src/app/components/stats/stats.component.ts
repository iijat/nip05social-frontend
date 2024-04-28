import { Component, OnInit } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { firstValueFrom } from 'rxjs';
import { ResponsiveService } from '../../services/responsive.service';
import { MatDialog } from '@angular/material/dialog';
import {
  ProfileDialogComponent,
  ProfileDialogData,
} from '../../component-dialogs/profile-dialog/profile-dialog.component';
import { UsageStatisticsOutput } from 'packages/shared/src/lib/graphql/output/statistics/usage-statistics-output';
import { UsageStatisticsQueryRoot } from 'packages/shared/src/lib/graphql/queries-and-mutations/statistics';

type DataRecord = {
  name: string;
  value: number;
};

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
})
export class StatsComponent implements OnInit {
  // #region Public Properties

  loading = false;
  usageStatistics: UsageStatisticsOutput | undefined;
  data: DataRecord[] = [];

  // #endregion Public Properties

  // #region Init

  constructor(
    private _apollo: Apollo,
    public responsiveService: ResponsiveService,
    private _matDialog: MatDialog
  ) {}

  ngOnInit(): void {
    this._loadStatisticsAsync();
  }

  // #endregion Init

  // #region Public Methods

  showProfile(pubkey: string) {
    const data: ProfileDialogData = {
      pubkey,
    };

    const height = this.responsiveService.isHandset ? '90vh' : '80vh';
    const width = this.responsiveService.isHandset ? '90vw' : '700px';
    const maxWidth = this.responsiveService.isHandset ? '' : '700px';
    this._matDialog.open(ProfileDialogComponent, {
      data,
      height,
      width,
      maxWidth,
    });
  }

  // #endregion Public Methods

  // #region Private Methods

  private async _loadStatisticsAsync() {
    this.loading = true;
    try {
      const result = await firstValueFrom(
        this._apollo.query<UsageStatisticsQueryRoot>({
          query: gql`
            query UsageStatistics {
              usageStatistics {
                date
                noOfUsers
                noOfRegistrations
                noOfLookupsYesterday
                noOfLookupsToday
                topLookupsToday {
                  identifier
                  domain
                  total
                  pubkey
                }
                lastRegistrations {
                  date
                  identifier
                  domain
                  pubkey
                }
                registrationsPerDomain {
                  domain
                  registrations
                }
              }
            }
          `,
          fetchPolicy: 'network-only',
        })
      );

      this.usageStatistics = result.data.usageStatistics;

      const data: DataRecord[] = [];
      this.usageStatistics?.registrationsPerDomain?.forEach((x) => {
        data.push({ name: x.domain ?? 'na', value: x.registrations ?? 0 });
      });
      this.data = data;
    } catch (error) {
      //
    } finally {
      this.loading = false;
    }
  }

  // #endregion Private Methods
}
