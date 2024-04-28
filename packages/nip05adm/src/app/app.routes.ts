import { Route } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { HomeComponent } from './components/home/home.component';
import { PublicRelaysComponent } from './components/home/public-relays/public-relays.component';
import { AccountDmComponent } from './components/home/account-dm/account-dm.component';
import { LoginComponent } from './components/login/login.component';
import { BotComponent } from './components/home/bot/bot.component';
import { PromoCodesComponent } from './components/home/promo-codes/promo-codes.component';

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
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'public-relays',
          },
          {
            path: 'public-relays',
            component: PublicRelaysComponent,
          },
          {
            path: 'account-dm',
            component: AccountDmComponent,
          },
          {
            path: 'bot',
            component: BotComponent,
          },
          {
            path: 'promo-codes',
            component: PromoCodesComponent,
          },
        ],
      },
      {
        path: 'login',
        component: LoginComponent,
      },
    ],
  },
];
