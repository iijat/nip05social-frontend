import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Apollo, gql, QueryRef } from 'apollo-angular';
import { Subscription, firstValueFrom } from 'rxjs';
import { ResponsiveService } from '../../../services/responsive.service';
import {
  ConfirmDialogData,
  ConfirmDialogComponent,
} from '../../../component-helpers/confirm-dialog/confirm-dialog.component';
import { AppModule } from '../../../app.module';
import { CatchError } from 'shared';
import { v4 as uuid } from 'uuid';
import { NostrAddressStatisticsOutput } from 'packages/shared/src/lib/graphql/output/statistics/nostr-address-statistics-output';
import { RegistrationChangeable } from 'packages/shared/src/lib/graphql/changeables/registration-changeable';
import {
  DeleteRegistrationMutationArgs,
  DeleteRegistrationMutationRoot,
  MyRegistrationsQueryRoot,
  NostrAddressStatisticsQueryArgs,
  NostrAddressStatisticsQueryRoot,
  UpdateRegistrationMutationArgs,
  UpdateRegistrationMutationRoot,
} from 'packages/shared/src/lib/graphql/crud/registration';
import { RegistrationRelayChangeable } from 'packages/shared/src/lib/graphql/changeables/registration-relay-changeable';
import {
  AddRegistrationRelayMutationArgs,
  AddRegistrationRelayMutationRoot,
  DeleteRegistrationRelayMutationArgs,
} from 'packages/shared/src/lib/graphql/queries-and-mutations/registration-relay';
import { FULL_FRAGMENT_REGISTRATION_RELY } from 'packages/shared/src/lib/graphql/fragments/full-fragment-registration-relay';
import { FULL_FRAGMENT_REGISTRATION } from 'packages/shared/src/lib/graphql/fragments/full-fragment-registration';
import { TokenService } from 'packages/shared/src/lib/services/token.service';
import { ToastService } from 'packages/shared/src/lib/services/toast.service';

interface IIndex {
  [key: string]: NostrAddressStatisticsOutput | undefined;
}

@Component({
  selector: 'app-protected-home',
  templateUrl: './protected-home.component.html',
  styleUrls: ['./protected-home.component.scss'],
})
export class ProtectedHomeComponent implements OnInit, OnDestroy {
  // #region Public Properties

  loading = false;
  myRegistrationChangeables: RegistrationChangeable[] | undefined;
  uuid1 = uuid();
  uuid2 = uuid();
  uuid3 = uuid();
  nostrAddressStatistics: IIndex = {};
  isInitialized = false;

  // #endregion Public Properties

  // #region Private Properties

  private _myRegistrationsQuery: QueryRef<MyRegistrationsQueryRoot> | undefined;
  private _myRegistrationsSubscription: Subscription | undefined;

  // #endregion Private Properties

  // #region Init

  constructor(
    private _apollo: Apollo,
    public responsiveService: ResponsiveService,
    private _dialog: MatDialog,
    private _toastService: ToastService,
    private _router: Router,
    private _tokenService: TokenService,
    private _matDialog: MatDialog
  ) {}

  ngOnInit(): void {
    this._loadData();
  }

  ngOnDestroy(): void {
    this._myRegistrationsSubscription?.unsubscribe();
  }

  // #endregion Init

  // #region Public Methods

  deleteRelay(
    event: MouseEvent,
    changeable: RegistrationRelayChangeable,
    registrationChangeable: RegistrationChangeable
  ) {
    // Make sure that the click event on the button does NOT
    // propagate. Otherwise the underlying input element will
    // get it, set focus and - on the handset - shows the keyboard.
    event.stopPropagation();

    const nostrAddress =
      registrationChangeable.original.identifier +
      '@' +
      registrationChangeable.original.systemDomain.name;

    const data: ConfirmDialogData = {
      title: 'Are you sure?',
      text: `Do you really want to delete your relay <b class="color-blue">${changeable.address}</b>
      for the nostr address <b class="color-blue">${nostrAddress}</b>?`,
      onConfirm: async () => {
        this._deleteRelay(changeable.original.id);
      },
    };

    const dialog = this._matDialog.open(ConfirmDialogComponent, {
      data,
    });

    dialog.afterClosed().subscribe((success) => {
      if (!success) {
        return;
      }
      const identify = AppModule.graphqlCache.identify({
        id: changeable.original.id,
        __typename: 'RegistrationRelayOutput',
      });

      AppModule.graphqlCache.modify({
        id: identify,
        fields(fieldValue, details) {
          return details.DELETE;
        },
      });
    });
  }

  async deleteLightningAddress(
    event: MouseEvent,
    registrationChangeable: RegistrationChangeable
  ) {
    event.stopPropagation();

    const data: ConfirmDialogData = {
      title: 'Are you sure?',
      text: `Do you really want to delete your lightning address <b class="color-blue">${registrationChangeable.lightningAddress}</b>?`,
      onConfirm: async () => {
        this._deleteLightningAddress(registrationChangeable);
      },
    };

    this._matDialog.open(ConfirmDialogComponent, {
      data,
    });
  }

  async onEmailForwardingOnChange(
    registrationChangeable: RegistrationChangeable
  ) {
    const message = await registrationChangeable.save();
    if (message) {
      registrationChangeable.emailForwardingOn =
        registrationChangeable.original.emailForwardingOn;
      this._toastService.error(message, 'Error');
    }
  }

  async onEmailOutChange(registrationChangeable: RegistrationChangeable) {
    const message = await registrationChangeable.save();
    if (message) {
      registrationChangeable.emailOut =
        registrationChangeable.original.emailOut;
      this._toastService.error(message, 'Error');
      return;
    }

    if (!registrationChangeable.emailOut) {
      return;
    }

    // If the registrations was activated, loop through
    // the other registrations and set true to false.

    // Loop through all other registrations and change the
    // one r
    // if necessary
    for (const regChangeable of this.myRegistrationChangeables?.filter(
      (x) => x.original.id !== registrationChangeable.original.id && x.emailOut
    ) ?? []) {
      regChangeable.emailOut = false;
      const retMessage = await regChangeable.save();
      if (retMessage) {
        regChangeable.emailOut = regChangeable.original.emailOut;
      }
    }
  }

  async addRelay(registrationChangeable: RegistrationChangeable) {
    try {
      const variables: AddRegistrationRelayMutationArgs = {
        registrationId: registrationChangeable.original.id,
        relay: 'wss://zebra.com',
      };

      const result = await firstValueFrom(
        this._apollo.mutate<AddRegistrationRelayMutationRoot>({
          mutation: gql`
            ${FULL_FRAGMENT_REGISTRATION_RELY}
            mutation AddRegistrationRelay(
              $registrationId: String!
              $relay: String
            ) {
              addRegistrationRelay(
                registrationId: $registrationId
                relay: $relay
              ) {
                ...FullFragmentRegistrationRelay
              }
            }
          `,
          variables,
          fetchPolicy: 'network-only',
        })
      );

      if (!result.data) {
        return;
      }

      this._myRegistrationsQuery?.refetch();
    } catch (error) {
      const message = new CatchError(error).message;
      this._toastService.error(message, 'Error');
    }
  }

  deleteRegistration(registrationChangeable: RegistrationChangeable) {
    const nip05 =
      registrationChangeable.original.identifier +
      '@' +
      registrationChangeable.original.systemDomain.name;

    const data: ConfirmDialogData = {
      title: 'Are you sure?',
      text: `Do you really want to delete <b class="color-blue">${nip05}</b>?<br>
      <br>
      All data related to that nostr address will be deleted. The address itself will be 
      free to register again.
      `,
      onConfirm: async () => {
        await this._deleteRegistration(registrationChangeable);
      },
    };

    const dialog = this._matDialog.open(ConfirmDialogComponent, { data });
    dialog.afterClosed().subscribe((success: boolean) => {
      if (!success) {
        return;
      }

      // 1. Delete the registrationChangeable from the list
      // 2. Delete the graphql object from the cache

      const index = this.myRegistrationChangeables?.indexOf(
        registrationChangeable
      );
      if (index) {
        this.myRegistrationChangeables?.splice(index, 1);
      }

      const identify = AppModule.graphqlCache.identify({
        id: registrationChangeable.original.id,
        __typename: 'RegistrationOutput',
      });

      AppModule.graphqlCache.modify({
        id: identify,
        fields(fieldValue, details) {
          return details.DELETE;
        },
      });
    });
  }

  // #endregion Public Methods

  // #region Private Methods

  private _loadData() {
    this._myRegistrationsSubscription?.unsubscribe();

    this.loading = true;

    this._myRegistrationsQuery =
      this._apollo.watchQuery<MyRegistrationsQueryRoot>({
        query: gql`
          ${FULL_FRAGMENT_REGISTRATION}
          query MyRegistrations {
            myRegistrations {
              ...FullFragmentRegistration

              systemDomain {
                id
                name
              }

              registrationRelays {
                id
                address
              }
            }
          }
        `,
        fetchPolicy: 'cache-and-network',
      });

    this._myRegistrationsSubscription =
      this._myRegistrationsQuery.valueChanges.subscribe({
        next: ({ data, loading }) => {
          if (!loading) {
            if (data.myRegistrations == null) {
              this._tokenService.unsetToken;
              this._router.navigate(['home']);
            } else {
              this.myRegistrationChangeables =
                RegistrationChangeable.createMany(
                  data.myRegistrations,
                  this._apollo
                );

              if (!this.isInitialized) {
                this.isInitialized = true;
                for (const x of data.myRegistrations) {
                  this._loadNostrAddressStatistics(x.id);
                }
              }
            }
            this.loading = false;
          }
        },
        error: (error) => {
          this.loading = false;
          const message = new CatchError(error).message;
          this._toastService.error(message, 'Error');
        },
      });
  }

  private async _deleteRelay(registrationRelayId: string) {
    const variables: DeleteRegistrationRelayMutationArgs = {
      registrationRelayId,
    };

    await firstValueFrom(
      this._apollo.mutate({
        mutation: gql`
          mutation DeleteRegistrationRelay($registrationRelayId: String!) {
            deleteRegistrationRelay(registrationRelayId: $registrationRelayId)
          }
        `,
        variables,
        fetchPolicy: 'network-only',
      })
    );
  }

  private async _deleteLightningAddress(
    registrationChangeable: RegistrationChangeable
  ) {
    const variables: UpdateRegistrationMutationArgs = {
      registrationId: registrationChangeable.original.id,
      data: {
        lightningAddress: null,
        emailForwardingOn: registrationChangeable.emailForwardingOn ?? false,
        emailOut: registrationChangeable.emailOut,
        emailOutSubject: registrationChangeable.emailOutSubject,
      },
    };

    await firstValueFrom(
      this._apollo.mutate<UpdateRegistrationMutationRoot>({
        mutation: gql`
          ${FULL_FRAGMENT_REGISTRATION}
          mutation UpdateRegistration(
            $registrationId: String!
            $data: RegistrationInputUpdate!
          ) {
            updateRegistration(registrationId: $registrationId, data: $data) {
              ...FullFragmentRegistration
            }
          }
        `,
        variables,
        fetchPolicy: 'network-only',
      })
    );
  }

  private async _loadNostrAddressStatistics(registrationId: string) {
    try {
      const variables: NostrAddressStatisticsQueryArgs = {
        registrationId,
      };

      const result = await firstValueFrom(
        this._apollo.query<NostrAddressStatisticsQueryRoot>({
          query: gql`
            query NostrAddressStatistics($registrationId: String!) {
              nostrAddressStatistics(registrationId: $registrationId) {
                id
                noOfLookups
                noOfLookupsToday
                noOfLookupsYesterday
              }
            }
          `,
          variables,
          fetchPolicy: 'network-only',
        })
      );

      this.nostrAddressStatistics[registrationId] =
        result.data.nostrAddressStatistics;
    } catch (error) {
      const message = new CatchError(error).message;
      console.log(message);
    }
  }

  private async _deleteRegistration(
    registrationChangeable: RegistrationChangeable
  ) {
    const variables: DeleteRegistrationMutationArgs = {
      registrationId: registrationChangeable.original.id,
    };

    const result = await firstValueFrom(
      this._apollo.mutate<DeleteRegistrationMutationRoot>({
        mutation: gql`
          mutation DeleteRegistration($registrationId: String!) {
            deleteRegistration(registrationId: $registrationId)
          }
        `,
        variables,
        fetchPolicy: 'network-only',
      })
    );
  }

  // #endregion Private Methods
}
