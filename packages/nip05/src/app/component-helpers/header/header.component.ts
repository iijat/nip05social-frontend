import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ResponsiveService } from '../../services/responsive.service';
import { HandsetMenuDialogComponent } from '../../component-dialogs/handset-menu-dialog/handset-menu-dialog.component';
import { TokenService } from 'packages/shared/src/lib/services/token.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  // #region Public Properties

  isHandsetMenuOpen = false;

  // #endregion Public Properties

  constructor(
    public responsiveService: ResponsiveService,
    private _router: Router,
    private _dialog: MatDialog,
    public tokenService: TokenService
  ) {}

  // #region Public Methods

  clickBrand() {
    this._router.navigate(['/home']);
  }

  openHandsetMenuDialog() {
    const dialog = this._dialog.open(HandsetMenuDialogComponent, {
      height: '100vh',
      width: '100vw',
      maxWidth: '100vw',
    });

    dialog.afterClosed().subscribe((event) => {
      (document.activeElement as HTMLElement).blur();

      switch (event) {
        case 'logout':
          this.tokenService.unsetToken();
          this._router.navigate(['/home']);
          break;

        case 'login':
          this._router.navigate(['/login']);
          break;

        case 'register':
          this._router.navigate(['/register']);
          break;

        case 'pricing':
          this._router.navigate(['/pricing']);
          break;

        case 'protected-home':
          this._router.navigate(['/s/home']);
          break;

        case 'protected-account':
          this._router.navigate(['/s/account']);
          break;

        default:
          break;
      }
    });
  }

  // #endregion Public Methods
}
