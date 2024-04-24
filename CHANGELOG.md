# NIP05.social - v2.1.2

_2024-02-16_

#### Changes

- Remove outdated NIP46 functionality.

# NIP05.social - v2.1.1

_2024-02-14_

#### Fixes

- Reload information about user subscription after invoice creation with 0 sats.

# NIP05.social - v2.1.0

_2024-02-13_

#### Features

- Introduce PROMO CODES to the invoicing.

# NIP05.social - v2.0.1

_2024-02-10_

#### Fixes

- Fix text on the home and the pricing view to reflect the new situation with subscriptions now available.

# NIP05.social - v2.0.0

_2024-02-10_

#### Features

- Enable subscriptions and invoicing for paid plans.

#### Changes

- Upgrade to Angular 17

# NIP05.social - v1.13.12

_2024-01-31_

#### Changes

# NIP05.social - v1.13.11

_2024-01-30_

#### Changes

- Show info "Send Email From Nostr" (but disabled).

# NIP05.social - v1.13.10

_2024-01-28_

#### Changes

- Update some texts to reflect the new situation (own private relay)

# NIP05.social - v1.13.9

_2024-01-24_

#### Changes

- Remove GraphQL subscriptions

# NIP05.social - v1.13.8

_2024-01-07_

#### Fixes

- Fix an issue when registering with an empty relay input when using the predefined list of relays.

# NIP05.social - v1.13.7

_2024-01-06_

#### Changes

- Add nip05adm and move "some things" to shared.

# NIP05.social - v1.13.6

_2024-01-06_

#### Changes

- Continue to prepare account section for subscriptions.

# NIP05.social - v1.13.5

_2024-01-02_

#### Changes

- Continue to prepare account section for subscriptions (currently hidden).

# NIP05.social - v1.13.4

_2023-12-31_

#### Changes

- Continue to prepare account section for subscriptions (currently hidden).

# NIP05.social - v1.13.3

_2023-12-29_

#### Changes

- Continue to prepare account section for subscriptions (currently hidden).

# NIP05.social - v1.13.2

_2023-12-27_

#### Changes

- Prepare account section for subscriptions (currently hidden).

# NIP05.social - v1.13.1

_2023-12-13_

#### Features

- Add info about upcoming **Plans & Pricing**

# NIP05.social - v1.13.0

_2023-12-11_

#### Changes

- Redesign Home.

# NIP05.social - v1.12.3

_2023-12-01_

#### Changes

- Prepare some things for EMAIL out (not visible yet).

# NIP05.social - v1.12.2

_2023-11-07_

#### Changes

- Change description in index.html.

# NIP05.social - v1.12.1

_2023-11-05_

#### Features

- Update preview image to include "EMAIL".

# NIP05.social - v1.12.0

_2023-11-05_

#### Features

- Add **Inbound Email Forwarding**.

# NIP05.social - v1.11.1

_2023-07-28_

#### Fixes

- Fixed some minor UI issues.

# NIP05.social - v1.11.0

_2023-07-28_

#### Features

- Implemented NIP-46 support for registration (registration with remote signer).

# NIP05.social - v1.10.0

_2023-07-25_

#### Features

- Implemented NIP-46 support for login (login with remote signer).

# NIP05.social - v1.9.0

2023-06-10

#### Added

- Add option to register with a NIP-07 browser extension.

# NIP05.social - v1.8.0

2023-06-08

#### Added

- Add option to login with a NIP-07 browser extension.

# NIP05.social - v1.7.0

2023-06-06

#### Added

- Show all registrations on the view **Directory**.

# NIP05.social - v1.6.0

2023-06-06

#### Added

- Add a profile view for users shown on the "stats" view.

# NIP05.social - v1.5.0

2023-05-30

#### Changed

- Add option to send the **registration code** via a predefined list of public relays (agent relayer support in the API).
- Refactor the registration view.

# NIP05.social - v1.4.0

2023-05-26

#### Changed

- Add option to send the **login code** via a predefined list of public relays (agent relayer support in the API).

# NIP05.social - v1.3.6

2023-05-20

#### Added

- Add link into the nostr registration message to automatically register without the need for manual code typing.

# NIP05.social - v1.3.5

2023-05-20

#### Added

- Add link into nostr login message to automatically login without the need for manual code typing.

# NIP05.social - v1.3.4

2023-05-17

#### Change

- Refactor home view.

# NIP05.social - v1.3.3

2023-05-17

#### Change

- Serve a new preview image (v3):
  ![asd](https://nip05assets.blob.core.windows.net/public/nip05.social%20-%20600x315%20-v3.png)

# NIP05.social - v1.3.2 [LN RELEASE]

2023-05-17

#### Change

- Unhide the section about "lightning address forwarding".

# NIP05.social - v1.3.0

2023-05-16

#### Added

- Add option to configure a lightning address forwarding (currently hidden).
- Add new view **Stats**.

#### Changed

- Redesign UI.

#### Fixed

- Fix minor issues.

# NIP05.social - v1.2.0

2023-05-08

#### Added

- Add some statistics to the view "Directory".

# NIP05.social - v1.1.3

2023-05-07

#### Added

- Add relay information to login and registration view (to help the user choose a relay).

# NIP05.social - v1.1.2

2023-05-07

#### Changed

- Change the login and registration form to hold the full (!) relay address and provide relay address validation.

# NIP05.social - v1.1.1

2023-05-04

#### Changed

- Minor UI tweaks.

# NIP05.social - v1.1.0

2023-05-04

#### Added

- Allow the user to choose from 6 different domains when registering a nostr address.
- Accept the pubkey in either npub or hex format.

##### Changed

- Reword "nip05" to "nostr address" ([NIP-05 is not Verification](https://habla.news/a/naddr1qqfxu6tsxq6j66tn94hx7apdwejhy6txqy08wumn8ghj7mn0wd68yttsw43zuam9d3kx7unyv4ezumn9wshsz9thwden5te0wfjkccte9ejxzmt4wvhxjme0qythwumn8ghj7un9d3shjtnwdaehgu3wvfskuep0qgs99d9qw67th0wr5xh05de4s9k0wjvnkxudkgptq8yg83vtulad30grqsqqqa28r5zvzu)).

##### Fixes

- Do some minor UI tweaks.s

# NIP05.social - v1.0.7

2023-04-28

#### Changed

- Load domain info and remove all hard coded "nip05.social" references.
- Make some input elements "lowercase".

# NIP05.social - v1.0.6

2023-04-18

#### Added

- Add meta tags for link preview.

# NIP05.social - v1.0.5

2023-04-15

#### Fixed

- Fix an issue where an authenticated user is clicking on login (in the home view) and then is logged out automatically.
- Fix issue when the client has an expired token and reloads "My Account". The token is now invalidated and the user is forwarded to the home view.

# NIP05.social - v1.0.4

2023-04-14

#### Changed

- Migrate to monorepo for the frontend project(s).

# NIP05.social - v1.0.3

2023-03-28

#### Changed

- Allow the user to be logged in with multiple devices at the same time.

# NIP05.social - v1.0.2

2023-03-26

#### Added

- Add section "Admin Info" in "My Account" showing only for system admins.

# NIP05.social - v1.0.1

2023-03-19

#### Fixed

- Fix issue where a verification pending registration is still shown in "My Identities" and "My Account".
- Fix issue when the client has an expired token and reloads "My Identities". The token is now invalidated and the user is forwarded to the home view.

#### Changed

- Change token validity to "1 day".
