import { Route } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { HomeComponent } from './components/home/home.component';
import { ContactComponent } from './components/contact/contact.component';
import { TosComponent } from './components/tos/tos.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { DirectoryComponent } from './components/directory/directory.component';
import { ProtectedComponent } from './components/protected/protected.component';
import { ProtectedHomeComponent } from './components/protected/protected-home/protected-home.component';
import { ProtectedAccountComponent } from './components/protected/protected-account/protected-account.component';
import { StatsComponent } from './components/stats/stats.component';
import { AloginComponent } from './components/alogin/alogin.component';
import { AregisterComponent } from './components/aregister/aregister.component';
import { PricingComponent } from './components/pricing/pricing.component';
import { Landing2Component } from './components/v2/landing2/landing2.component';
import { Home2Component } from './components/v2/home2/home2.component';
import { Plans2Component } from './components/v2/plans2/plans2.component';
import { Stats2Component } from './components/v2/stats2/stats2.component';
import { Terms2Component } from './components/v2/terms2/terms2.component';
import { Login2Component } from './components/v2/login2/login2.component';

export const appRoutes: Route[] = [
  {
    path: '',
    component: Landing2Component,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home',
      },
      {
        path: 'home',
        component: Home2Component,
      },
      {
        path: 'plans',
        component: Plans2Component,
      },
      {
        path: 'stats',
        component: Stats2Component,
      },
      {
        path: 'terms',
        component: Terms2Component,
      },
      {
        path: 'login',
        component: Login2Component,
      },
    ],
    // component: LandingComponent,
    // children: [
    //   {
    //     path: '',
    //     pathMatch: 'full',
    //     redirectTo: 'home',
    //   },
    //   {
    //     path: 'home',
    //     component: HomeComponent,
    //   },
    //   {
    //     path: 'contact',
    //     component: ContactComponent,
    //   },
    //   {
    //     path: 'tos',
    //     component: TosComponent,
    //   },
    //   {
    //     path: 'register',
    //     component: RegisterComponent,
    //   },
    //   {
    //     path: 'login',
    //     component: LoginComponent,
    //   },
    //   {
    //     path: 'alogin/:userId/:code',
    //     component: AloginComponent,
    //   },
    //   {
    //     path: 'aregister/:userId/:registrationId/:code',
    //     component: AregisterComponent,
    //   },
    //   {
    //     path: 'stats',
    //     component: StatsComponent,
    //   },
    //   {
    //     path: 'directory',
    //     component: DirectoryComponent,
    //   },
    //   {
    //     path: 'pricing',
    //     component: PricingComponent,
    //   },
    //   {
    //     path: 's',
    //     component: ProtectedComponent,
    //     children: [
    //       {
    //         path: 'home',
    //         component: ProtectedHomeComponent,
    //       },
    //       {
    //         path: 'account',
    //         component: ProtectedAccountComponent,
    //       },
    //     ],
    //   },
    // ],
  },
];
