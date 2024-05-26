import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { appRoutes } from './app.routes';

import { environment } from '../environments/environment';

import { HttpClientModule } from '@angular/common/http';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache, ApolloLink, split } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from '@angular/cdk/clipboard';

import { TokenService } from 'packages/shared/src/lib/services/token.service';

import { FormsModule } from '@angular/forms';

import { NgxChartsModule } from '@swimlane/ngx-charts';
import { QRCodeModule } from 'angularx-qrcode';

import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatGridListModule } from '@angular/material/grid-list';
import { OverlayModule } from '@angular/cdk/overlay';

import { ContactComponent } from './components/contact/contact.component';
import { DirectoryComponent } from './components/directory/directory.component';
import { HomeComponent } from './components/home/home.component';
import { LandingComponent } from './components/landing/landing.component';
import { LoginComponent } from './components/login/login.component';
import { ProtectedComponent } from './components/protected/protected.component';
import { RegisterComponent } from './components/register/register.component';
import { TosComponent } from './components/tos/tos.component';
import { ButtonComponent } from './component-helpers/button/button.component';
import { CardComponent } from './component-helpers/card/card.component';
import { ChipComponent } from './component-helpers/chip/chip.component';
import { ConfirmDialogComponent } from './component-helpers/confirm-dialog/confirm-dialog.component';
import { FooterComponent } from './component-helpers/footer/footer.component';
import { HeaderComponent } from './component-helpers/header/header.component';
import { SpaceComponent } from './component-helpers/space/space.component';
import { TextButtonComponent } from './component-helpers/text-button/text-button.component';
import { ToastComponent } from './component-helpers/toast/toast.component';
import { HandsetMenuDialogComponent } from './component-dialogs/handset-menu-dialog/handset-menu-dialog.component';
import { ProtectedAccountComponent } from './components/protected/protected-account/protected-account.component';
import { ProtectedHomeComponent } from './components/protected/protected-home/protected-home.component';
import { RelayQuoteComponent } from './component-helpers/relay-quote/relay-quote.component';
import { StatsBlockComponent } from './component-helpers/stats-block/stats-block.component';
import { StatsComponent } from './components/stats/stats.component';
import { AloginComponent } from './components/alogin/alogin.component';
import { AregisterComponent } from './components/aregister/aregister.component';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { ProfileDialogComponent } from './component-dialogs/profile-dialog/profile-dialog.component';
import { ProfileItemComponent } from './component-helpers/profile-item/profile-item.component';
import { PricingComponent } from './components/pricing/pricing.component';
import { PlanBasicComponent } from './component-helpers/plan-basic/plan-basic.component';
import { PlanProComponent } from './component-helpers/plan-pro/plan-pro.component';
import { PlanAdvancedComponent } from './component-helpers/plan-advanced/plan-advanced.component';
import { AlbyInvoiceDialogComponent } from './component-dialogs/alby-invoice-dialog/alby-invoice-dialog.component';
import { Landing2Component } from './components/v2/landing2/landing2.component';
import { Header2Component } from './component-helpers/v2/header2/header2.component';
import { Home2Component } from './components/v2/home2/home2.component';
import { Card2Component } from './component-helpers/v2/card2/card2.component';
import { Footer2Component } from './component-helpers/v2/footer2/footer2.component';
import { Stats2Component } from './components/v2/stats2/stats2.component';
import { Terms2Component } from './components/v2/terms2/terms2.component';
import { Plans2Component } from './components/v2/plans2/plans2.component';
import { Button2Component } from './component-helpers/v2/button2/button2.component';
import { Login2Component } from './components/v2/login2/login2.component';
import { Input2Component } from './component-helpers/v2/input2/input2.component';
import { MenuButton2Component } from './component-helpers/v2/menu-button2/menu-button2.component';
import { RelaysComponent } from './components/v2/relays/relays.component';
import { LoginViaDmComponent } from './components/v2/login-via-dm/login-via-dm.component';
import { PinInputComponent } from './component-helpers/v2/pin-input/pin-input.component';
import { SecureComponent } from './components/secure/secure.component';
import { SecureAccountComponent } from './components/secure/secure-account/secure-account.component';
import { LoginViaExtensionComponent } from './components/v2/login-via-extension/login-via-extension.component';
import { TableComponent } from './component-helpers/v2/table/table.component';
import { DatePipe } from '@angular/common';
import { StatComponent } from './component-helpers/v2/stat/stat.component';
import { SecureAccountNostrComponent } from './components/secure/secure-account/secure-account-nostr/secure-account-nostr.component';
import { SecureAccountPlanComponent } from './components/secure/secure-account/secure-account-plan/secure-account-plan.component';
import { IonicModule } from '@ionic/angular';
import { StepperComponent } from './component-helpers/stepper/stepper.component';
import { StepComponent } from './component-helpers/stepper/step/step.component';
import { RegisterOutComponent } from './components/register-out/register-out.component';

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
    ContactComponent,
    DirectoryComponent,
    HomeComponent,
    LandingComponent,
    LoginComponent,
    ProtectedComponent,
    RegisterComponent,
    TosComponent,
    ButtonComponent,
    CardComponent,
    ChipComponent,
    ConfirmDialogComponent,
    FooterComponent,
    HeaderComponent,
    SpaceComponent,
    TextButtonComponent,
    ToastComponent,
    HandsetMenuDialogComponent,
    ProtectedAccountComponent,
    ProtectedHomeComponent,
    RelayQuoteComponent,
    StatsBlockComponent,
    StatsComponent,
    AloginComponent,
    AregisterComponent,
    ProfileDialogComponent,
    ProfileItemComponent,
    PricingComponent,
    PlanBasicComponent,
    PlanProComponent,
    PlanAdvancedComponent,
    AlbyInvoiceDialogComponent,
    Landing2Component,
    Header2Component,
    Home2Component,
    Card2Component,
    Footer2Component,
    Stats2Component,
    Terms2Component,
    Plans2Component,
    Button2Component,
    Login2Component,
    Input2Component,
    MenuButton2Component,
    RelaysComponent,
    LoginViaDmComponent,
    PinInputComponent,
    SecureComponent,
    SecureAccountComponent,
    LoginViaExtensionComponent,
    TableComponent,
    StatComponent,
    SecureAccountNostrComponent,
    SecureAccountNostrComponent,
    SecureAccountPlanComponent,
    StepperComponent,
    StepComponent,
    RegisterOutComponent,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    ApolloModule,
    HttpClientModule,
    BrowserAnimationsModule,

    ClipboardModule,
    ReactiveFormsModule,

    FormsModule,

    NgxChartsModule,
    QRCodeModule,

    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatRadioModule,
    MatSelectModule,
    MatTabsModule,
    MatTooltipModule,

    OverlayModule,

    RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' }),
  ],
  providers: [
    DatePipe,
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
  // schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {
  static graphqlCache: InMemoryCache = graphqlCache;
}
