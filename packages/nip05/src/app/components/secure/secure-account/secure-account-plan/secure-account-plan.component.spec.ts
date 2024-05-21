import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SecureAccountPlanComponent } from './secure-account-plan.component';

describe('SecureAccountPlanComponent', () => {
  let component: SecureAccountPlanComponent;
  let fixture: ComponentFixture<SecureAccountPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SecureAccountPlanComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SecureAccountPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
