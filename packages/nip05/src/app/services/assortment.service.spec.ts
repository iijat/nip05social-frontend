import { TestBed } from '@angular/core/testing';

import { AssortmentService } from './assortment.service';

describe('AssortmentService', () => {
  let service: AssortmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssortmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
