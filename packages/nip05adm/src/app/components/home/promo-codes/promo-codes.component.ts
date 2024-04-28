import { Component, OnInit, OnDestroy } from '@angular/core';
import { Apollo, QueryRef, gql } from 'apollo-angular';
import {
  AdmCreatePromoCodeMutationArgs,
  AdmCreatePromoCodeMutationRoot,
  AdmDeletePromoCodeMutationArgs,
  AdmDeletePromoCodeMutationRoot,
  AdmPromoCodesQueryRoot,
} from 'packages/shared/src/lib/graphql/crud/promo-code';
import { FULL_FRAGMENT_PROMO_CODE } from 'packages/shared/src/lib/graphql/fragments/full-fragment-promo-code';
import { PromoCodeOutput } from 'packages/shared/src/lib/graphql/output/promo-code-output';
import { Subscription, first, firstValueFrom } from 'rxjs';

class NewPromoCode {
  sats = 6000;
  validityInDays = 30;
  pubkey: string | undefined;
  info: string | null = 'Promo';
}

const AdmPromoCodesQuery = gql`
  ${FULL_FRAGMENT_PROMO_CODE}
  query AdmPromoCodes {
    admPromoCodes {
      ...FullFragmentPromoCode
    }
  }
`;

@Component({
  selector: 'app-promo-codes',
  templateUrl: './promo-codes.component.html',
  styleUrl: './promo-codes.component.scss',
})
export class PromoCodesComponent implements OnInit, OnDestroy {
  loading = false;
  promoCodes: PromoCodeOutput[] = [];
  selectedPromoCode: PromoCodeOutput | undefined;

  newPromoCode = new NewPromoCode();

  #promoCodesQuery: QueryRef<AdmPromoCodesQueryRoot> | undefined;
  #promoCodesSubscription: Subscription | undefined;

  constructor(private apollo: Apollo) {}

  ngOnInit(): void {
    this.#loadData();
  }

  ngOnDestroy(): void {
    this.#promoCodesSubscription?.unsubscribe();
  }

  onClickRow(promoCode: PromoCodeOutput) {
    if (this.selectedPromoCode === promoCode) {
      this.selectedPromoCode = undefined;
    } else {
      this.selectedPromoCode = promoCode;
    }
  }

  async onDeletePromoCode(promoCode: PromoCodeOutput) {
    try {
      const variables: AdmDeletePromoCodeMutationArgs = {
        id: promoCode.id,
      };

      await firstValueFrom(
        this.apollo.mutate<AdmDeletePromoCodeMutationRoot>({
          mutation: gql`
            mutation AdmDeletePromoCode($id: Int!) {
              admDeletePromoCode(id: $id)
            }
          `,
          fetchPolicy: 'network-only',
          variables,
          update: (cache, { data }) => {
            if (!data?.admDeletePromoCode) {
              return;
            }

            const cachedPromoCodes =
              cache.readQuery<AdmPromoCodesQueryRoot>({
                query: AdmPromoCodesQuery,
              })?.admPromoCodes ?? [];

            cache.writeQuery<AdmPromoCodesQueryRoot>({
              query: AdmPromoCodesQuery,
              data: {
                admPromoCodes: cachedPromoCodes.filter(
                  (x) => x.id !== promoCode.id
                ),
              },
            });
          },
        })
      );
    } catch (error) {
      console.error(error);
    }
  }

  async createPromoCode() {
    try {
      const variables: AdmCreatePromoCodeMutationArgs = {
        sats: this.newPromoCode.sats,
        validityInDays: this.newPromoCode.validityInDays,
        pubkey: this.newPromoCode.pubkey,
        info: this.newPromoCode.info ?? null,
      };

      await firstValueFrom(
        this.apollo.mutate<AdmCreatePromoCodeMutationRoot>({
          mutation: gql`
            ${FULL_FRAGMENT_PROMO_CODE}
            mutation AdmCreatePromoCode(
              $sats: Int!
              $validityInDays: Int!
              $pubkey: String
              $info: String
            ) {
              admCreatePromoCode(
                sats: $sats
                validityInDays: $validityInDays
                pubkey: $pubkey
                info: $info
              ) {
                ...FullFragmentPromoCode
              }
            }
          `,
          fetchPolicy: 'network-only',
          variables,
          update: (cache, { data }) => {
            if (!data?.admCreatePromoCode) {
              return;
            }
            const promoCode = data.admCreatePromoCode;
            const cachedPromoCodes =
              cache.readQuery<AdmPromoCodesQueryRoot>({
                query: AdmPromoCodesQuery,
              })?.admPromoCodes ?? [];

            cache.writeQuery<AdmPromoCodesQueryRoot>({
              query: AdmPromoCodesQuery,
              data: {
                admPromoCodes: [promoCode, ...cachedPromoCodes].sortBy(
                  (x) => x.validUntil,
                  'desc'
                ),
              },
            });
          },
        })
      );
    } catch (error) {
      console.error(error);
    }
  }

  async #loadData() {
    this.#promoCodesSubscription?.unsubscribe();
    this.loading = true;

    this.#promoCodesQuery = this.apollo.watchQuery<AdmPromoCodesQueryRoot>({
      query: AdmPromoCodesQuery,
      fetchPolicy: 'cache-and-network',
    });

    this.#promoCodesSubscription = this.#promoCodesQuery.valueChanges.subscribe(
      {
        next: ({ data, loading }) => {
          this.promoCodes = data.admPromoCodes.sortBy(
            (x) => x.validUntil,
            'desc'
          );
          if (!loading) {
            this.loading = false;
          }
        },
        error: (error) => {
          this.loading = false;
        },
      }
    );
  }
}
