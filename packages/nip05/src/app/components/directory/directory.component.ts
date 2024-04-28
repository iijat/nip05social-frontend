import { Component, OnInit } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { firstValueFrom } from 'rxjs';
import { CatchError } from 'shared';
import {
  ProfileDialogComponent,
  ProfileDialogData,
} from '../../component-dialogs/profile-dialog/profile-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ResponsiveService } from '../../services/responsive.service';
import { DirectoryRegistrationOutput } from 'packages/shared/src/lib/graphql/output/directory-registration-output';
import { DirectoryRegistrationsQueryRoot } from 'packages/shared/src/lib/graphql/crud/directory';
import { ToastService } from 'packages/shared/src/lib/services/toast.service';

@Component({
  selector: 'app-directory',
  templateUrl: './directory.component.html',
  styleUrls: ['./directory.component.scss'],
})
export class DirectoryComponent implements OnInit {
  // #region Public Properties

  loading = false;
  registrations: DirectoryRegistrationOutput[] = [];

  // #endregion Public Properties

  // #region Init

  constructor(
    private _apollo: Apollo,
    private _toastService: ToastService,
    private _matDialog: MatDialog,
    private _responsiveService: ResponsiveService
  ) {}

  ngOnInit(): void {
    this._loadData();
  }

  // #endregion Init

  // #region Public Methods

  showProfile(pubkey: string) {
    const data: ProfileDialogData = {
      pubkey,
    };

    const height = this._responsiveService.isHandset ? '90vh' : '80vh';
    const width = this._responsiveService.isHandset ? '90vw' : '700px';
    const maxWidth = this._responsiveService.isHandset ? '' : '700px';
    this._matDialog.open(ProfileDialogComponent, {
      data,
      height,
      width,
      maxWidth,
    });
  }

  // #endregion Public Methods

  // #region Private Methods

  private async _loadData() {
    try {
      this.loading = true;

      const result = await firstValueFrom(
        this._apollo.query<DirectoryRegistrationsQueryRoot>({
          query: gql`
            query DirectoryRegistrations {
              directoryRegistrations {
                name
                domain
                lookups
                pubkey
              }
            }
          `,
          fetchPolicy: 'cache-first',
        })
      );

      this.registrations = result.data.directoryRegistrations;
    } catch (error) {
      const message = new CatchError(error).message;
      this._toastService.error(message, 'Error');
    } finally {
      this.loading = false;
    }
  }

  // #endregion Private Methods
}
