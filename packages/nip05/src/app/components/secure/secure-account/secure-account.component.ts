import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from 'packages/shared/src/lib/services/token.service';

@Component({
  selector: 'app-secure-account',
  templateUrl: './secure-account.component.html',
  styleUrl: './secure-account.component.scss',
})
export class SecureAccountComponent implements OnInit {
  nostrActivity = false;

  constructor(private tokenService: TokenService, private router: Router) {}

  ngOnInit(): void {
    if (!this.tokenService.token?.isValid()) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.#loadData();
  }

  async onNostrActivityChange(activity: boolean) {
    window.setTimeout(() => {
      this.nostrActivity = activity;
    }, 100);
  }

  async #loadData() {
    // todo
  }
}
