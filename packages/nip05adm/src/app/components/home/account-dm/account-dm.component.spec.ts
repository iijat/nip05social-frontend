import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountDmComponent } from './account-dm.component';

describe('AccountDmComponent', () => {
  let component: AccountDmComponent;
  let fixture: ComponentFixture<AccountDmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccountDmComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountDmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
