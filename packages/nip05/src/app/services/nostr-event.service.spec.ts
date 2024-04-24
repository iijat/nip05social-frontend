import { TestBed } from '@angular/core/testing';

import { NostrEventService } from './nostr-event.service';

describe('NostrEventService', () => {
  let service: NostrEventService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NostrEventService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
