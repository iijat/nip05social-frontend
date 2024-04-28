import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Apollo, gql, QueryRef } from 'apollo-angular';
import { firstValueFrom, Subscription } from 'rxjs';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../component-helpers/confirm-dialog/confirm-dialog.component';
import { ErrorHandling } from '../../../helpers/error-handling';
import { ResponsiveService } from '../../../services/responsive.service';
import { HelperNostr } from '../../../helpers/helper-nostr';
import { Clipboard } from '@angular/cdk/clipboard';
import { CatchError } from 'shared';
import {
  AlbyInvoiceDialogComponent,
  AlbyInvoiceDialogData,
  AlbyInvoiceDialogResult,
} from '../../../component-dialogs/alby-invoice-dialog/alby-invoice-dialog.component';
import { FULL_FRAGMENT_USER } from 'packages/shared/src/lib/graphql/fragments/full-fragment-user';
import { FULL_FRAGMENT_SUBSCRIPTION } from 'packages/shared/src/lib/graphql/fragments/full-fragment-subscription';
import { FULL_FRAGMENT_USER_SUBSCRIPTION } from 'packages/shared/src/lib/graphql/fragments/full-fragment-user-subscription';
import { FULL_FRAGMENT_USER_SUBSCRIPTION_INVOICE } from 'packages/shared/src/lib/graphql/fragments/full-fragment-user-subscription-invoice';
import { FULL_FRAGMENT_USER_SUBSCRIPTION_INVOICE_PAYMENT } from 'packages/shared/src/lib/graphql/fragments/full-fragment-user-subscription-invoice-payment';
import { UserOutput } from 'packages/shared/src/lib/graphql/output/user-output';
import { UserSubscriptionOutput } from 'packages/shared/src/lib/graphql/output/user-subscription-output';
import { StatOutput } from 'packages/shared/src/lib/graphql/output/stat-output';
import { SubscriptionCalcOutput } from 'packages/shared/src/lib/graphql/output/subscription-calc-output';
import {
  DeleteMyUserMutationRoot,
  MyUserQueryRoot,
} from 'packages/shared/src/lib/graphql/queries-and-mutations/user';
import {
  CancelPendingUserSubscriptionMutationArgs,
  CancelPendingUserSubscriptionMutationRoot,
  MyUserSubscriptionsQueryRoot,
} from 'packages/shared/src/lib/graphql/crud/user-subscription';
import {
  CreateUserSubscriptionWithInvoiceMutationArgs,
  CreateUserSubscriptionWithInvoiceMutationRoot,
  CreateUserSubscriptionWithoutInvoiceMutationArgs,
  CreateUserSubscriptionWithoutInvoiceMutationRoot,
} from 'packages/shared/src/lib/graphql/crud/subscription';
import {
  SubscriptionCalcQueryArgs,
  SubscriptionCalcQueryRoot,
} from 'packages/shared/src/lib/graphql/crud/subscription-calc';
import { FULL_FRAGMENT_SUBSCRIPTION_CALC } from 'packages/shared/src/lib/graphql/fragments/full-fragment-subscription-calc';
import { AdminStatsQueryRoot } from 'packages/shared/src/lib/graphql/queries-and-mutations/admin';
import { TokenService } from 'packages/shared/src/lib/services/token.service';
import { ToastService } from 'packages/shared/src/lib/services/toast.service';

const MY_USER_QUERY = gql`
  ${FULL_FRAGMENT_USER}
  ${FULL_FRAGMENT_SUBSCRIPTION}
  query MyUser {
    myUser {
      ...FullFragmentUser
      registrations {
        id
        identifier
        nipped
        systemDomain {
          id
          name
        }
      }
      subscription {
        ...FullFragmentSubscription
      }
    }
  }
`;

const MY_USER_SUBSCRIPTIONS_QUERY = gql`
  ${FULL_FRAGMENT_USER_SUBSCRIPTION}
  ${FULL_FRAGMENT_USER_SUBSCRIPTION_INVOICE}
  ${FULL_FRAGMENT_USER_SUBSCRIPTION_INVOICE_PAYMENT}
  query MyUserSubscriptions {
    myUserSubscriptions {
      ...FullFragmentUserSubscription
      oldSubscription {
        id
        name
      }
      newSubscription {
        id
        name
      }
      userSubscriptionInvoice {
        ...FullFragmentUserSubscriptionInvoice
        userSubscriptionInvoicePayment {
          ...FullFragmentUserSubscriptionInvoicePayment
        }
      }
    }
  }
`;

@Component({
  selector: 'app-protected-account',
  templateUrl: './protected-account.component.html',
  styleUrls: ['./protected-account.component.scss'],
})
export class ProtectedAccountComponent implements OnInit, OnDestroy {
  // #region Public Properties

  loading = false;
  loadingMyUserSubscriptions = false;
  myUser: UserOutput | undefined;
  myUserSubscriptions: UserSubscriptionOutput[] = [];
  adminStats: StatOutput | undefined | null;
  subscriptionChangeNextPlanId: string | undefined;
  subscriptionChangeAddDays = 0;
  subscriptionChangePromoCode: string | undefined;
  subscriptionCalc: SubscriptionCalcOutput | undefined;
  subscriptionChangeOngoing = false;

  // #endregion Public Properties

  // #region Private Properties

  #myUserQuery: QueryRef<MyUserQueryRoot> | undefined;
  #myUserSubscription: Subscription | undefined;
  #myUserSubscriptionsQuery: QueryRef<MyUserSubscriptionsQueryRoot> | undefined;
  #myUserSubscriptionsSubscription: Subscription | undefined;
  #hasLoadedAdminData = false;

  // #endregion Private Properties

  // #region Init

  constructor(
    private apollo: Apollo,
    private toastService: ToastService,
    private dialog: MatDialog,
    private tokenService: TokenService,
    private router: Router,
    public responsiveService: ResponsiveService,
    private clipboard: Clipboard
  ) {}

  ngOnInit(): void {
    this.#loadData();
  }

  ngOnDestroy(): void {
    this.#myUserSubscription?.unsubscribe();
    this.#myUserSubscriptionsSubscription?.unsubscribe();
  }

  // #endregion Init

  // #region Public Methods

  reducePubkey = HelperNostr.reducePubkey;

  removePromoCode() {
    this.subscriptionChangePromoCode = undefined;
    this.#calcSubscriptionChange();
  }

  showInvoice(userSubscription: UserSubscriptionOutput) {
    if (!userSubscription.userSubscriptionInvoice) {
      return;
    }

    const data: AlbyInvoiceDialogData = {
      subscription: userSubscription,
      invoice: userSubscription.userSubscriptionInvoice,
      payment:
        userSubscription.userSubscriptionInvoice
          .userSubscriptionInvoicePayment ?? undefined,
    };

    const dialog = this.dialog.open(AlbyInvoiceDialogComponent, {
      data,
      autoFocus: false,
      maxWidth: 400,
    });

    dialog
      .afterClosed()
      .subscribe(async (result: AlbyInvoiceDialogResult | undefined) => {
        if (!result) {
          return;
        }

        if (result === 'cancel-invoice') {
          await this.cancelUserSubscription(userSubscription);
        }
      });
  }

  async cancelUserSubscription(userSubscription: UserSubscriptionOutput) {
    if (!userSubscription.pending || userSubscription.cancelled) {
      return;
    }

    const data: ConfirmDialogData = {
      title: 'Are you sure?',
      text: 'Do you really want to cancel this pending subscription change?',
      onConfirm: async () => {
        const variables: CancelPendingUserSubscriptionMutationArgs = {
          userSubscriptionId: userSubscription.id,
        };

        const result = await firstValueFrom(
          this.apollo.mutate<CancelPendingUserSubscriptionMutationRoot>({
            mutation: gql`
              ${FULL_FRAGMENT_USER_SUBSCRIPTION}
              mutation CancelPendingUserSubscription(
                $userSubscriptionId: Int!
              ) {
                cancelPendingUserSubscription(
                  userSubscriptionId: $userSubscriptionId
                ) {
                  ...FullFragmentUserSubscription
                }
              }
            `,
            variables,
            fetchPolicy: 'network-only',
          })
        );
      },
    };

    const dialog = this.dialog.open(ConfirmDialogComponent, {
      data,
    });

    dialog.afterClosed().subscribe(() => {
      (document.activeElement as HTMLElement).blur();
    });
  }

  logout() {
    this.tokenService.unsetToken();
    this.router.navigate(['/home']);
  }

  async deleteMyUser() {
    const data: ConfirmDialogData = {
      title: 'Are you sure?',
      text: `Do you really want to delete your account?
      <br>
      <br>
      All user related data will be deleted including all of your registered identifiers.`,
      onConfirm: async () => {
        await firstValueFrom(
          this.apollo.mutate<DeleteMyUserMutationRoot>({
            mutation: gql`
              mutation DeleteMyUser {
                deleteMyUser
              }
            `,
            fetchPolicy: 'network-only',
          })
        );
      },
    };

    const confirmDialog = this.dialog.open(ConfirmDialogComponent, { data });

    confirmDialog.afterClosed().subscribe((success) => {
      if (success) {
        this.tokenService.unsetToken();
        this.router.navigate(['/home']);
      }
    });
  }

  copyToClipboard(text: string) {
    this.clipboard.copy(text);
  }

  addDays(days: number) {
    if (this.subscriptionChangeAddDays + days < 0) {
      return;
    }
    this.subscriptionChangeAddDays += days;
    this.#calcSubscriptionChange();
  }

  doSubscriptionCalc() {
    this.#calcSubscriptionChange();
  }

  async changeSubscriptionWithoutInvoice() {
    // ChangeSubscriptionWithoutInvoiceMutationArgs
    try {
      if (!this.subscriptionChangeNextPlanId) {
        return;
      }

      this.subscriptionChangeOngoing = true;

      const variables: CreateUserSubscriptionWithoutInvoiceMutationArgs = {
        subscriptionId: Number.parseInt(this.subscriptionChangeNextPlanId),
        days: this.subscriptionChangeAddDays,
      };

      const result = await firstValueFrom(
        this.apollo.mutate<CreateUserSubscriptionWithoutInvoiceMutationRoot>({
          mutation: gql`
            ${FULL_FRAGMENT_USER}
            ${FULL_FRAGMENT_SUBSCRIPTION}
            mutation CreateUserSubscriptionWithoutInvoice(
              $subscriptionId: Int!
              $days: Int!
            ) {
              createUserSubscriptionWithoutInvoice(
                subscriptionId: $subscriptionId
                days: $days
              ) {
                ...FullFragmentUser
                subscription {
                  ...FullFragmentSubscription
                }
              }
            }
          `,
          variables,
          fetchPolicy: 'network-only',
        })
      );
      this.loadingMyUserSubscriptions = true;
      this.subscriptionCalc = undefined;
      this.#myUserSubscriptionsQuery?.refetch();
    } catch (error) {
      this.toastService.error(new CatchError(error).message);
    } finally {
      this.subscriptionChangeOngoing = false;
    }
  }

  async changeSubscriptionWithInvoice() {
    try {
      if (!this.subscriptionChangeNextPlanId) {
        return;
      }

      this.subscriptionChangeOngoing = true;

      const variables: CreateUserSubscriptionWithInvoiceMutationArgs = {
        subscriptionId: Number.parseInt(this.subscriptionChangeNextPlanId),
        days: this.subscriptionChangeAddDays,
        promoCode: this.subscriptionChangePromoCode ?? null,
      };

      const result = await firstValueFrom(
        this.apollo.mutate<CreateUserSubscriptionWithInvoiceMutationRoot>({
          mutation: gql`
            ${FULL_FRAGMENT_USER_SUBSCRIPTION}
            ${FULL_FRAGMENT_USER_SUBSCRIPTION_INVOICE}
            mutation CreateUserSubscriptionWithInvoice(
              $subscriptionId: Int!
              $days: Int!
              $promoCode: String
            ) {
              createUserSubscriptionWithInvoice(
                subscriptionId: $subscriptionId
                days: $days
                promoCode: $promoCode
              ) {
                ...FullFragmentUserSubscription
                oldSubscription {
                  id
                  name
                }
                newSubscription {
                  id
                  name
                }
                userSubscriptionInvoice {
                  ...FullFragmentUserSubscriptionInvoice
                }
              }
            }
          `,
          variables,
          fetchPolicy: 'network-only',
          update: (cache, result) => {
            if (!result.data?.createUserSubscriptionWithInvoice) {
              return;
            }

            const cachedArray = cache.readQuery<MyUserSubscriptionsQueryRoot>({
              query: MY_USER_SUBSCRIPTIONS_QUERY,
            })?.myUserSubscriptions;

            if (typeof cachedArray === 'undefined') {
              return;
            }

            cache.writeQuery<MyUserSubscriptionsQueryRoot>({
              query: MY_USER_SUBSCRIPTIONS_QUERY,
              data: {
                myUserSubscriptions: [
                  result.data.createUserSubscriptionWithInvoice,
                  ...cachedArray,
                ],
              },
            });
          },
        })
      );

      this.subscriptionCalc = undefined;
      this.subscriptionChangePromoCode = undefined;

      // Show invoice in dialog.
      const uS = result.data?.createUserSubscriptionWithInvoice;
      if (!uS) {
        return;
      }

      // Only show invoice if the invoice is pending.
      // I.E: Don't show invoice where a promo code has reduced the amount to 0.
      if (uS.pending === true) {
        this.showInvoice(uS);
      } else {
        this.#myUserQuery?.refetch();
      }
    } catch (error) {
      this.toastService.error(new CatchError(error).message);
    } finally {
      this.subscriptionChangeOngoing = false;
    }
  }

  // #endregion Public Methods

  // #region Private Methods

  #loadData() {
    this.loading = true;

    this.#myUserQuery = this.apollo.watchQuery<MyUserQueryRoot>({
      query: MY_USER_QUERY,
      fetchPolicy: 'cache-and-network',
    });

    this.#myUserSubscription = this.#myUserQuery.valueChanges.subscribe({
      next: ({ data, loading }) => {
        if (!loading) {
          if (data.myUser == null) {
            this.tokenService.unsetToken;
            this.router.navigate(['home']);
          } else {
            this.myUser = data.myUser;

            if (this.myUser.subscriptionId === 1) {
              this.subscriptionChangeNextPlanId = '2';
            } else {
              this.subscriptionChangeNextPlanId =
                this.myUser.subscriptionId.toString();
            }

            if (this.myUser.isSystemUser === true) {
              this._loadAdminDataAsync();
            }
          }
          this.loading = false;
        }
      },
      error: (error) => {
        this.loading = false;
        const message = ErrorHandling.extract(error);
        this.toastService.error(message, 'Error');
      },
    });

    this.loadingMyUserSubscriptions = true;

    this.#myUserSubscriptionsQuery =
      this.apollo.watchQuery<MyUserSubscriptionsQueryRoot>({
        query: MY_USER_SUBSCRIPTIONS_QUERY,
        fetchPolicy: 'cache-and-network',
      });

    this.#myUserSubscriptionsSubscription =
      this.#myUserSubscriptionsQuery.valueChanges.subscribe({
        next: ({ data, loading }) => {
          this.myUserSubscriptions = data.myUserSubscriptions;
          this.loadingMyUserSubscriptions = false;
        },
        error: (error) => {
          this.loadingMyUserSubscriptions = false;
          this.toastService.error(new CatchError(error).message, 'Error');
        },
      });
  }

  async #calcSubscriptionChange() {
    if (!this.subscriptionChangeNextPlanId) {
      return;
    }

    try {
      const variables: SubscriptionCalcQueryArgs = {
        subscriptionId: Number.parseInt(this.subscriptionChangeNextPlanId),
        days: this.subscriptionChangeAddDays,
        promoCode: this.subscriptionChangePromoCode ?? null,
      };

      const result = await firstValueFrom(
        this.apollo.query<SubscriptionCalcQueryRoot>({
          query: gql`
            ${FULL_FRAGMENT_SUBSCRIPTION_CALC}
            query SubscriptionCalc(
              $subscriptionId: Int!
              $days: Int!
              $promoCode: String
            ) {
              subscriptionCalc(
                subscriptionId: $subscriptionId
                days: $days
                promoCode: $promoCode
              ) {
                ...FullFragmentSubscriptionCalc
              }
            }
          `,
          variables,
          fetchPolicy: 'no-cache',
        })
      );

      this.subscriptionCalc = result.data.subscriptionCalc;
    } catch (error) {
      this.toastService.error(new CatchError(error).message);
    }
  }

  private async _loadAdminDataAsync() {
    if (this.#hasLoadedAdminData) {
      return;
    }

    try {
      const result = await firstValueFrom(
        this.apollo.query<AdminStatsQueryRoot>({
          query: gql`
            query AdminStats {
              adminStats {
                noOfUsersDate
                noOfUsers
                noOfLookupsDate
                noOfLookups
              }
            }
          `,
          fetchPolicy: 'no-cache',
        })
      );

      this.adminStats = result.data.adminStats;
      this.#hasLoadedAdminData = true;
    } catch (error) {
      this.toastService.error(ErrorHandling.extract(error), 'Error');
    }
  }

  // #endregion Private Methods
}
