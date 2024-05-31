import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { IonCheckbox } from '@ionic/angular';
import { Apollo } from 'apollo-angular';
import { OpenApiService } from 'packages/nip05/src/app/services/open-api-service';
import { SelectionService } from 'packages/nip05/src/app/services/selection-service';
import {
  RegistrationDto,
  RegistrationPatchDto,
} from 'packages/nip05/src/open-api/@types';
import { ToastService } from 'packages/shared/src/lib/services/toast.service';

const LOCAL_STORAGE_KEY = {
  SETTINGS_SELECTED_NOSTR_ADDRESS: 'settingsSelectedNostrAddress',
};

@Component({
  selector: 'app-secure-account-nostr',
  templateUrl: './secure-account-nostr.component.html',
  styleUrl: './secure-account-nostr.component.scss',
})
export class SecureAccountNostrComponent implements OnInit {
  activity = false;
  @Output() activityChange = new EventEmitter<boolean>();
  registrations: RegistrationDto[] = [];

  get selectedRegistration() {
    return this.#selectedRegistration;
  }
  set selectedRegistration(value: RegistrationDto | undefined) {
    this.#selectedRegistration = value;
    localStorage.setItem(
      LOCAL_STORAGE_KEY.SETTINGS_SELECTED_NOSTR_ADDRESS,
      value?.nostrAddress ?? ''
    );

    this.selectionService.selectedRegistrationId = value?.id ?? undefined;
  }

  #selectedRegistration: RegistrationDto | undefined;

  constructor(
    private router: Router,
    private toastService: ToastService,
    private selectionService: SelectionService,
    private openApiService: OpenApiService
  ) {}

  ngOnInit(): void {
    this.#loadData();
  }

  onClickRegister() {
    this.router.navigateByUrl('/register-out/undefined');
  }

  onLightningAddressEscape(input: HTMLInputElement) {
    input.value = this.selectedRegistration?.lightningAddress ?? '';
  }

  async onLightningAddressChange(
    event: [value: string, input: HTMLInputElement],
    registration: RegistrationDto
  ) {
    if (event[0] === registration.lightningAddress) {
      return; // The address has not changed.
    }

    // Build patch object:
    const patchObject: RegistrationPatchDto = {
      lightningAddress: event[0] === '' ? null : event[0],
    };

    const result = await this.#patchRegistration(registration.id, patchObject);

    if (!result) {
      event[1].value = registration.lightningAddress ?? '';
    }
  }

  onRelayEscape(input: HTMLInputElement, relayIndex: number) {
    input.value = this.selectedRegistration?.relays[relayIndex] ?? '';
  }

  async onRelayChange(
    event: [value: string, input: HTMLInputElement],
    relayIndex: number
  ) {
    if (!this.selectedRegistration) {
      return;
    }

    if (event[0] === this.selectedRegistration.relays[relayIndex]) {
      return; // The relay has not changed.
    }

    const clonedArray = Array.from(this.selectedRegistration.relays);
    clonedArray.splice(relayIndex, 1, event[0] ?? '');

    const patchObject: RegistrationPatchDto = {
      relays: clonedArray.filter((x) => x !== ''),
    };

    const result = await this.#patchRegistration(
      this.selectedRegistration.id,
      patchObject
    );

    if (!result) {
      event[1].value = this.selectedRegistration.relays[relayIndex];
    }
  }

  async onNewRelay(event: [value: string, input: HTMLInputElement]) {
    if (!this.selectedRegistration || !event[0]) {
      return;
    }

    const patchObject: RegistrationPatchDto = {
      relays: [...(this.selectedRegistration?.relays ?? []), event[0]],
    };

    const result = await this.#patchRegistration(
      this.selectedRegistration.id,
      patchObject
    );

    event[1].value = '';
  }

  async onEmailInChange(event: boolean, checkBox: IonCheckbox) {
    if (!this.selectedRegistration) {
      return;
    }

    const patchObject: RegistrationPatchDto = {
      emailIn: event,
    };

    const result = await this.#patchRegistration(
      this.selectedRegistration.id,
      patchObject
    );

    if (!result) {
      // Rollback.
      checkBox.checked = !event;
    }
  }

  async onEmailOutChange(event: boolean, checkBox: IonCheckbox) {
    if (!this.selectedRegistration) {
      return;
    }

    const patchObject: RegistrationPatchDto = {
      emailOut: event,
    };

    const result = await this.#patchRegistration(
      this.selectedRegistration.id,
      patchObject
    );

    if (!result) {
      // Rollback.
      checkBox.checked = !event;
    } else {
      // Manually adjust all other nostr addresses and set emailOut to false.
      this.registrations
        .filter((x) => x.id !== this.selectedRegistration?.id)
        .forEach(async (registration) => {
          registration.emailOut = false;
        });
    }
  }

  async #patchRegistration(
    registrationId: string,
    patchObject: RegistrationPatchDto
  ): Promise<RegistrationDto | undefined> {
    this.#setActivity(true);
    const result = await this.openApiService.client.PATCH(
      '/registration/{id}',
      {
        params: {
          path: {
            id: registrationId,
          },
        },
        body: patchObject,
        headers: {
          Authorization: this.openApiService.authorizationHeader,
        },
      }
    );
    this.#setActivity(false);

    if (result.response.status === 401) {
      // Unauthorized
      await this.router.navigateByUrl('/login');
      return undefined;
    }

    if (result.error) {
      this.toastService.error(
        result.error.message ??
          'An error occurred while updating the registration.'
      );
      return undefined;
    }

    const index = this.registrations.findIndex((x) => x.id === registrationId);
    this.registrations.splice(index, 1, result.data);
    this.selectedRegistration = result.data;
    return result.data;
  }

  async #loadData() {
    this.#setActivity(true);
    const result = await this.openApiService.client.GET('/registrations', {
      headers: {
        Authorization: this.openApiService.authorizationHeader,
      },
    });
    this.#setActivity(false);

    if (result.response.status === 401) {
      // Unauthorized
      await this.router.navigateByUrl('/login');
      return;
    }

    if (result.error) {
      this.toastService.error(
        result.error.message ?? 'An error occurred while loading registrations.'
      );
      return;
    }

    this.registrations = result.data ?? [];

    // Set selectedRegistration
    if (
      this.selectionService.selectedRegistrationId &&
      this.registrations
        .map((x) => x.id)
        .includes(this.selectionService.selectedRegistrationId)
    ) {
      this.selectedRegistration = this.registrations.find(
        (x) => x.id === this.selectionService.selectedRegistrationId
      );
    } else {
      // Try to get the selected registration from local storage.
      const lsSelectedNostrAddress = localStorage.getItem(
        LOCAL_STORAGE_KEY.SETTINGS_SELECTED_NOSTR_ADDRESS
      );
      if (lsSelectedNostrAddress === null) {
        this.selectedRegistration = this.registrations[0];
      } else {
        const selectedRegistration = this.registrations.find(
          (x) => x.nostrAddress === lsSelectedNostrAddress
        );
        if (selectedRegistration) {
          this.selectedRegistration = selectedRegistration;
        } else {
          this.selectedRegistration = this.registrations[0];
        }
      }
    }
  }

  #setActivity(activity: boolean) {
    this.activity = activity;
    this.activityChange.emit(activity);
  }
}
