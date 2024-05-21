import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../../services/login-service';
import { ToastService } from 'packages/shared/src/lib/services/toast.service';
import { CatchError } from 'shared';
import { Router } from '@angular/router';
import { RouteParamsService } from '../../../services/route-params-service';

const LOGIN_CREDENTIALS = 'login-credentials';

@Component({
  selector: 'app-login',
  templateUrl: './login2.component.html',
  styleUrl: './login2.component.scss',
})
export class Login2Component implements OnInit {
  loginCredentials = '';
  ongoingLoginViaDm = false;

  constructor(
    private loginService: LoginService,
    private toastService: ToastService,
    private router: Router,
    private routeParamsService: RouteParamsService
  ) {}

  ngOnInit(): void {
    const loginCredentials = localStorage.getItem(LOGIN_CREDENTIALS);
    if (loginCredentials) {
      this.loginCredentials = loginCredentials;
    }
  }

  async onClickLoginViaDm() {
    if (this.ongoingLoginViaDm) {
      return;
    }

    this.ongoingLoginViaDm = true;
    try {
      const result = await this.loginService.loginViaDm(
        this.loginCredentials.toLowerCase()
      );
      localStorage.setItem(LOGIN_CREDENTIALS, this.loginCredentials);
      const key = this.routeParamsService.store(result);

      await this.router.navigateByUrl(`/login-via-dm/${key}`);
    } catch (error) {
      this.toastService.error(new CatchError(error).message);
    } finally {
      this.ongoingLoginViaDm = false;
    }
  }

  async onClickLoginViaExtension() {
    await this.router.navigateByUrl('/login-via-extension');
  }
}
