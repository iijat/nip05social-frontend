import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { appRoutes } from './app.routes';
import { LandingComponent } from './components/landing/landing.component';
import { HomeComponent } from './components/home/home.component';
import { environment } from '../environments/environment';
import { InMemoryCache, ApolloLink, split } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { HttpClientModule } from '@angular/common/http';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { TokenService } from 'packages/shared/src/lib/services/token.service';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MtxSplitModule } from '@ng-matero/extensions/split';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { LoginComponent } from './components/login/login.component';
import { PublicRelaysComponent } from './components/home/public-relays/public-relays.component';
import { AccountDmComponent } from './components/home/account-dm/account-dm.component';
import { BotComponent } from './components/home/bot/bot.component';
import { PromoCodesComponent } from './components/home/promo-codes/promo-codes.component';

let apiUrl = environment.apiUrl;
if (!apiUrl) {
  throw new Error("ENV variable 'API_URL' missing.");
}

if (apiUrl[apiUrl.length - 1] !== '/') {
  apiUrl += '/';
}

let wsUrl = apiUrl + 'subscriptions';
wsUrl = wsUrl.replace('https', 'wss');
wsUrl = wsUrl.replace('http', 'ws');

const graphqlCache = new InMemoryCache({
  typePolicies: {
    RegistrationOutput: {
      fields: {
        registrationRelays: {
          merge(existing, incoming, { mergeObjects }) {
            return incoming;
          },
        },
      },
    },
  },
});

@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    HomeComponent,
    LoginComponent,
    PublicRelaysComponent,
    AccountDmComponent,
    LoginComponent,
    BotComponent,
    AccountDmComponent,
    PromoCodesComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,

    ApolloModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,

    MtxSplitModule,

    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatSlideToggleModule,

    RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' }),
  ],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory(httpLink: HttpLink, tokenService: TokenService) {
        const auth = setContext((operation, context) => {
          const token = tokenService.token;

          if (!token) {
            return {};
          } else {
            return {
              headers: {
                Nip05SocialAuthorization: token.token,
                Nip05SocialUserId: token.userId,
                Nip05SocialDeviceId: token.deviceId ?? '',
              },
            };
          }
        });

        const apolloLink = ApolloLink.from([
          auth,
          httpLink.create({
            uri: `${apiUrl}graphql`,
          }),
        ]);

        const ws = new GraphQLWsLink(
          // https://github.com/enisdenjo/graphql-ws/blob/master/docs/interfaces/client.ClientOptions.md#connectionparams
          createClient({
            url: wsUrl,
            connectionParams: async () => {
              //const accessToken = await firstValueFrom(auth0Service.getAccessTokenSilently());
              const accessToken = 'Hi';
              return {
                accessToken,
              };
            },
            shouldRetry: () => {
              return true;
            },
          })
        );

        const link = split(
          // split based on operation type
          ({ query }) => {
            const call = getMainDefinition(query);
            return (
              call.kind === 'OperationDefinition' &&
              call.operation === 'subscription'
            );
          },
          ws,
          apolloLink
        );

        return {
          cache: graphqlCache,
          link,
        };
      },
      deps: [HttpLink, TokenService],
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  static graphqlCache: InMemoryCache = graphqlCache;
}
