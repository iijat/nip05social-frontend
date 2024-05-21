import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SecureAccountNostrComponent } from './secure-account-nostr.component';

describe('SecureAccountNostrComponent', () => {
  let component: SecureAccountNostrComponent;
  let fixture: ComponentFixture<SecureAccountNostrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SecureAccountNostrComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SecureAccountNostrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
