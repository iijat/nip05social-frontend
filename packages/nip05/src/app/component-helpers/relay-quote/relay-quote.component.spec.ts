import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelayQuoteComponent } from './relay-quote.component';

describe('RelayQuoteComponent', () => {
  let component: RelayQuoteComponent;
  let fixture: ComponentFixture<RelayQuoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RelayQuoteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelayQuoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
