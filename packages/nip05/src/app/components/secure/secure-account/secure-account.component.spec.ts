import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SecureAccountComponent } from './secure-account.component';

describe('SecureAccountComponent', () => {
  let component: SecureAccountComponent;
  let fixture: ComponentFixture<SecureAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SecureAccountComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SecureAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
