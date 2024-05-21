import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from 'packages/shared/src/lib/services/token.service';

@Component({
  selector: 'app-header2',
  templateUrl: './header2.component.html',
  styleUrl: './header2.component.scss',
})
export class Header2Component {
  menuIsOpen = false;
  tokenIsValid: boolean | undefined;

  constructor(private router: Router, private tokenService: TokenService) {}

  async onMenuButtonClick(route: string) {
    this.menuIsOpen = !this.menuIsOpen;
    await this.router.navigateByUrl(route);
  }

  evaluateToken() {
    this.tokenIsValid = this.tokenService.token?.isValid();
  }

  async onClickLogout() {
    this.menuIsOpen = !this.menuIsOpen;
    this.tokenService.unsetToken();
    await this.router.navigateByUrl('/login');
  }
}
