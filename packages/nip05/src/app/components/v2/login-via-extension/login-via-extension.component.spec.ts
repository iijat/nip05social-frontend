import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginViaExtensionComponent } from './login-via-extension.component';

describe('LoginViaExtensionComponent', () => {
  let component: LoginViaExtensionComponent;
  let fixture: ComponentFixture<LoginViaExtensionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginViaExtensionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginViaExtensionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
