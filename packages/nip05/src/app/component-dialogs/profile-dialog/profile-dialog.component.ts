import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  NostrEventKind0Content,
  NostrEventWrapper,
} from '../../models/nostr/type-defs';
import {
  NostrHelperV2,
  NostrPubkeyObject,
} from '../../models/nostr/nostr-helper-v2';
import {
  CustomEventType,
  NostrEventService,
} from '../../services/nostr-event.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ResponsiveService } from '../../services/responsive.service';
import { HelperNostr } from '../../helpers/helper-nostr';
import { Clipboard } from '@angular/cdk/clipboard';

export type ProfileDialogData = {
  /** Can either be in HEX or NPUB format. */
  pubkey: string;
};

interface Copy2Clipboard {
  [x: string]: boolean;
}

@Component({
  selector: 'app-profile-dialog',
  templateUrl: './profile-dialog.component.html',
  styleUrls: ['./profile-dialog.component.scss'],
})
export class ProfileDialogComponent implements OnInit, OnDestroy {
  // #region Public Properties

  loading = false;
  errorMessage: string | undefined;
  c2c: Copy2Clipboard = {};

  pubkeyObject: NostrPubkeyObject | undefined;
  pubkeyNostrEventWrapper:
    | NostrEventWrapper<NostrEventKind0Content>
    | undefined;

  get pictureSize(): number {
    return this.responsiveService.isHandset ? 80 : 160;
  }
  get pictureMarginNegative() {
    return `-${this.pictureSize / 2}px`;
  }

  get pictureMarginPositive() {
    return `${this.pictureSize / 2}px`;
  }

  get defaultBannerUrl() {
    return 'https://nip05assets.blob.core.windows.net/public/profile-background-3.jpg';
  }
  get name(): string | undefined {
    if (this.pubkeyNostrEventWrapper?.content?.display_name) {
      return this.pubkeyNostrEventWrapper.content.display_name;
    }
    if (this.pubkeyNostrEventWrapper?.content?.displayName) {
      return this.pubkeyNostrEventWrapper.content.displayName;
    }
    if (this.pubkeyNostrEventWrapper?.content?.name) {
      return this.pubkeyNostrEventWrapper.content?.name;
    }
    return undefined;
  }

  get defaultPicture() {
    return 'https://nip05assets.blob.core.windows.net/public/robot-head-01.jpg';
  }

  reducePubkey = HelperNostr.reducePubkey;

  get npub(): string | undefined {
    return this._responsiveService.isHandset
      ? this.reducePubkey(this.pubkeyObject?.npub)
      : this.pubkeyObject?.npub;
  }
  get hex(): string | undefined {
    return this._responsiveService.isHandset
      ? this.reducePubkey(this.pubkeyObject?.hex)
      : this.pubkeyObject?.hex;
  }

  // #endregion Public Properties

  // #region Private Properties

  private _newProfileSubscription: Subscription | undefined;
  private _customEventSubscription: Subscription | undefined;

  // #endregion Private Properties

  // #region Init

  constructor(
    private _nostrEventService: NostrEventService,
    @Inject(MAT_DIALOG_DATA) public data: ProfileDialogData,
    private _dialogRef: MatDialogRef<ProfileDialogComponent>,
    public responsiveService: ResponsiveService,
    private _responsiveService: ResponsiveService
  ) {}

  ngOnInit(): void {
    const pubkeyObject = NostrHelperV2.getNostrPubkeyObject(this.data.pubkey);
    this.pubkeyObject = pubkeyObject;

    this._newProfileSubscription =
      this._nostrEventService.eventNewProfile.subscribe((newProfile) => {
        if (
          newProfile.pubkey === this.pubkeyObject?.hex &&
          typeof this.pubkeyNostrEventWrapper === 'undefined'
        ) {
          this.pubkeyNostrEventWrapper = newProfile;
          this.loading = false;
        }

        // TODO: Handle other profiles than the param profile.
      });

    this._customEventSubscription =
      this._nostrEventService.eventCustom.subscribe((customEvent) => {
        if (customEvent.type === CustomEventType.isEot) {
          if (customEvent.pubkey === this.pubkeyObject?.hex) {
            this.loading = false;
          }
        }
      });

    const cachedProfile = this._nostrEventService.getCachedProfile(
      this.pubkeyObject.hex
    );
    if (!cachedProfile) {
      this.loading = true;
    } else {
      this.pubkeyNostrEventWrapper = cachedProfile;
    }

    this._nostrEventService.queryProfileOnline(this.pubkeyObject.hex);
  }

  ngOnDestroy(): void {
    this._newProfileSubscription?.unsubscribe();
    this._customEventSubscription?.unsubscribe();
  }

  // #endregion Init

  // #region Public Methods

  close() {
    this._dialogRef.close();
  }

  getNostrEvent() {
    //
  }

  // #endregion Public Methods

  // #region Private Methods

  // #endregion Private Methods
}
