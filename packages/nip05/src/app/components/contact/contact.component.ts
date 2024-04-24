import { Component } from '@angular/core';
import { HelperNostr } from '../../helpers/helper-nostr';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent {
  chrisPubkey =
    'npub1py8yuj8q0ce3k757k5n4xfu5j6dtzzrdm7jdsp0llzxxxk8f69ws9zgr8n';
  chrisNip05 = 'chris@nip05.social';

  reducePubkey = HelperNostr.reducePubkey;
}
