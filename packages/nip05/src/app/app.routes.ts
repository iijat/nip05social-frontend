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

export const appRoutes: Route[] = [
  {
    path: '',
    component: LandingComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home',
      },
      {
        path: 'home',
        component: HomeComponent,
      },
      {
        path: 'contact',
        component: ContactComponent,
      },
      {
        path: 'tos',
        component: TosComponent,
      },
      {
        path: 'register',
        component: RegisterComponent,
      },
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'alogin/:userId/:code',
        component: AloginComponent,
      },
      {
        path: 'aregister/:userId/:registrationId/:code',
        component: AregisterComponent,
      },
      {
        path: 'stats',
        component: StatsComponent,
      },
      {
        path: 'directory',
        component: DirectoryComponent,
      },
      {
        path: 'pricing',
        component: PricingComponent,
      },
      {
        path: 's',
        component: ProtectedComponent,
        children: [
          {
            path: 'home',
            component: ProtectedHomeComponent,
          },
          {
            path: 'account',
            component: ProtectedAccountComponent,
          },
        ],
      },
    ],
  },
];
