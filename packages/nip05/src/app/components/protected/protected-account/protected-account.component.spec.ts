import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProtectedAccountComponent } from './protected-account.component';

describe('ProtectedAccountComponent', () => {
  let component: ProtectedAccountComponent;
  let fixture: ComponentFixture<ProtectedAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProtectedAccountComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProtectedAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
