import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginViaDmComponent } from './login-via-dm.component';

describe('LoginViaDmComponent', () => {
  let component: LoginViaDmComponent;
  let fixture: ComponentFixture<LoginViaDmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginViaDmComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginViaDmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
