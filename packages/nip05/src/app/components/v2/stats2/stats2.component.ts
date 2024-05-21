import { Component, OnInit } from '@angular/core';
import { ColorHelper, ScaleType } from '@swimlane/ngx-charts';
import { Apollo, gql } from 'apollo-angular';
import { UsageStatisticsOutput } from 'packages/shared/src/lib/graphql/output/statistics/usage-statistics-output';
import { UsageStatisticsQueryRoot } from 'packages/shared/src/lib/graphql/queries-and-mutations/statistics';
import { Observable, Observer, firstValueFrom } from 'rxjs';
import { TableHeader } from '../../../component-helpers/v2/table/table.common';
import { DatePipe } from '@angular/common';

type DataRecord = {
  name: string;
  value: number;
};

@Component({
  selector: 'app-stats2',
  templateUrl: './stats2.component.html',
  styleUrl: './stats2.component.scss',
})
export class Stats2Component implements OnInit {
  activity = false;
  usageStatistics: UsageStatisticsOutput | undefined;
  data: DataRecord[] = [];

  colors = new ColorHelper('cool', ScaleType.Ordinal, [], null);

  readonly lastRegistrationsHeaders: TableHeader[] = [
    {
      displayName: 'Date',
      propertyName: 'date',
      propertyTransform: (rowData: any) => {
        return new Observable<string>((observer: Observer<string>) => {
          const value =
            this.datePipe.transform(rowData.date, 'MMM d, y, HH:mm') ?? 'na';
          observer.next(value);
          observer.complete();
        });
      },
    },
    {
      displayName: 'Name',
      propertyName: 'identifier',
    },
    {
      displayName: 'Domain',
      propertyName: 'domain',
    },
  ];

  topLookupsHeaders: TableHeader[] = [
    {
      displayName: 'Lookups',
      propertyName: 'total',
    },
    {
      displayName: 'Name',
      propertyName: 'identifier',
    },
    {
      displayName: 'Domain',
      propertyName: 'domain',
    },
  ];

  constructor(private apollo: Apollo, private datePipe: DatePipe) {}

  ngOnInit(): void {
    this.#loadData();
  }

  async #loadData() {
    this.activity = true;
    try {
      const result = await firstValueFrom(
        this.apollo.query<UsageStatisticsQueryRoot>({
          query: gql`
            query UsageStatistics {
              usageStatistics {
                date
                noOfUsers
                noOfRegistrations
                noOfLookupsTotal
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
      console.error('Error loading statistics:', error);
    } finally {
      this.activity = false;
    }
  }
}
