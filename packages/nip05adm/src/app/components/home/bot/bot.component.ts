import {
  Component,
  OnInit,
  OnDestroy,
  ɵgetUnknownElementStrictMode,
} from '@angular/core';
import { Apollo, QueryRef, gql } from 'apollo-angular';
import {
  AdmBotMetadatasQueryRoot,
  AdmCreateBotMetadataMutationArgs,
  AdmCreateBotMetadataMutationRoot,
  AdmPublishBotMetadataMutationArgs,
  AdmPublishBotMetadataMutationRoot,
  AdmUpdateBotMetadataMutationArgs,
  AdmUpdateBotMetadataMutationRoot,
} from 'packages/shared/src/lib/graphql/crud/bot-metadata';
import { FULL_FRAGMENT_BOT_METADATA } from 'packages/shared/src/lib/graphql/fragments/full-fragment-bot-metadata';
import { FULL_FRAGMENT_BOT_METADATA_RELAY } from 'packages/shared/src/lib/graphql/fragments/full-fragment-bot-metadata-relay';
import { BotMetadataOutput } from 'packages/shared/src/lib/graphql/output/bot-metadata-output';
import { ToastService } from 'packages/shared/src/lib/services/toast.service';
import { Subscription, firstValueFrom } from 'rxjs';
import { CatchError } from 'shared';
import { v4 } from 'uuid';

const admBotMetadatasQuery = gql`
  ${FULL_FRAGMENT_BOT_METADATA}
  ${FULL_FRAGMENT_BOT_METADATA_RELAY}
  query AdmBotMetadatas {
    admBotMetadatas {
      ...FullFragmentBotMetadata
      botMetadataRelays {
        ...FullFragmentBotMetadataRelay
      }
    }
  }
`;

class BotMetadata {
  nip05?: string;
  name?: string;
  about?: string;
  picture?: string;
  banner?: string;

  get origin(): BotMetadataOutput | undefined {
    return this.#origin;
  }

  #origin: BotMetadataOutput | undefined;

  setOrigin(data: BotMetadataOutput) {
    this.#origin = data;
    this.nip05 = data.nip05;
    this.name = data.name;
    this.about = data.about ?? undefined;
    this.picture = data.picture ?? undefined;
    this.banner = data.banner ?? undefined;
  }
}

@Component({
  selector: 'app-bot',
  templateUrl: './bot.component.html',
  styleUrls: ['./bot.component.scss'],
})
export class BotComponent implements OnInit, OnDestroy {
  loading = false;
  activity = false;
  uuid1 = v4();
  uuid2 = v4();
  uuid3 = v4();
  botMetadata = new BotMetadata();

  botMetadatas: BotMetadataOutput[] = [];

  #botMetadatasQuery: QueryRef<AdmBotMetadatasQueryRoot> | undefined;
  #botMetadatasSubscription: Subscription | undefined;

  constructor(private apollo: Apollo, private toastService: ToastService) {}

  ngOnInit(): void {
    this.#loadData();
  }

  ngOnDestroy(): void {
    this.#botMetadatasSubscription?.unsubscribe();
  }

  async createBotMetadata() {
    if (!this.botMetadata.nip05 || !this.botMetadata.name) {
      return;
    }

    try {
      this.activity = true;

      const variables: AdmCreateBotMetadataMutationArgs = {
        nip05: this.botMetadata.nip05,
        name: this.botMetadata.name,
        about: this.botMetadata.about ?? null,
        picture: this.botMetadata.picture ?? null,
        banner: this.botMetadata.banner ?? null,
      };

      await firstValueFrom(
        this.apollo.mutate<AdmCreateBotMetadataMutationRoot>({
          mutation: gql`
            ${FULL_FRAGMENT_BOT_METADATA}
            mutation AdmCreateBotMetadata(
              $nip05: String!
              $name: String!
              $about: String
              $picture: String
              $banner: String
            ) {
              admCreateBotMetadata(
                nip05: $nip05
                name: $name
                about: $about
                picture: $picture
                banner: $banner
              ) {
                ...FullFragmentBotMetadata
              }
            }
          `,
          variables,
          fetchPolicy: 'network-only',
          update: (cache, { data }) => {
            if (!data?.admCreateBotMetadata) {
              return;
            }

            const cachedBotMetadatas =
              cache.readQuery<AdmBotMetadatasQueryRoot>({
                query: admBotMetadatasQuery,
              })?.admBotMetadatas ?? [];

            cache.writeQuery<AdmBotMetadatasQueryRoot>({
              query: admBotMetadatasQuery,
              data: {
                admBotMetadatas: [
                  data.admCreateBotMetadata,
                  ...cachedBotMetadatas,
                ],
              },
            });

            this.botMetadata.setOrigin(data.admCreateBotMetadata);
          },
        })
      );
    } catch (error) {
      this.toastService.error(new CatchError(error).message);
    } finally {
      this.activity = false;
    }
  }

  async updateBotMetadata() {
    if (
      !this.botMetadata.nip05 ||
      !this.botMetadata.name ||
      !this.botMetadata.origin
    ) {
      return;
    }

    try {
      this.activity = true;

      const variables: AdmUpdateBotMetadataMutationArgs = {
        id: this.botMetadata.origin.id,
        data: {
          nip05: this.botMetadata.nip05,
          name: this.botMetadata.name,
          about: this.botMetadata.about,
          picture: this.botMetadata.picture,
          banner: this.botMetadata.banner,
        },
      };

      await firstValueFrom(
        this.apollo.mutate<AdmUpdateBotMetadataMutationRoot>({
          mutation: gql`
            ${FULL_FRAGMENT_BOT_METADATA}
            ${FULL_FRAGMENT_BOT_METADATA_RELAY}
            mutation AdmUpdateBotMetadata(
              $id: Int!
              $data: BotMetadataInputUpdate!
            ) {
              admUpdateBotMetadata(id: $id, data: $data) {
                ...FullFragmentBotMetadata
                botMetadataRelays {
                  ...FullFragmentBotMetadataRelay
                }
              }
            }
          `,
          variables,
          fetchPolicy: 'network-only',
          update: (cache, { data }) => {
            if (!data?.admUpdateBotMetadata) {
              return;
            }

            this.botMetadata.setOrigin(data.admUpdateBotMetadata);
          },
        })
      );
    } catch (error) {
      this.toastService.error(new CatchError(error).message);
    } finally {
      this.activity = false;
    }
  }

  async publishBotMetadata() {
    if (!this.botMetadata.origin) {
      return;
    }

    try {
      this.activity = true;

      const variables: AdmPublishBotMetadataMutationArgs = {
        botMetadataId: this.botMetadata.origin.id,
      };

      await firstValueFrom(
        this.apollo.mutate<AdmPublishBotMetadataMutationRoot>({
          mutation: gql`
            ${FULL_FRAGMENT_BOT_METADATA_RELAY}
            mutation AdmPublishBotMetadata($botMetadataId: Int!) {
              admPublishBotMetadata(botMetadataId: $botMetadataId) {
                id
                botMetadataRelays {
                  ...FullFragmentBotMetadataRelay
                }
              }
            }
          `,
          variables,
          fetchPolicy: 'network-only',
        })
      );
    } catch (error) {
      this.toastService.error(new CatchError(error).message);
      console.log(error);
    } finally {
      this.activity = false;
    }
  }

  async #loadData() {
    this.loading = true;

    this.#botMetadatasQuery = this.apollo.watchQuery<AdmBotMetadatasQueryRoot>({
      query: admBotMetadatasQuery,
      fetchPolicy: 'cache-and-network',
    });

    this.#botMetadatasSubscription =
      this.#botMetadatasQuery.valueChanges.subscribe({
        next: ({ data, loading }) => {
          this.loading = false;
          this.botMetadatas = data.admBotMetadatas.sortBy(
            (x) => x.createdAt,
            'desc'
          );
        },
        error: (error) => {
          this.loading = false;
          this.toastService.error(new CatchError(error).message);
        },
      });
  }
}
