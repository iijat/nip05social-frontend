import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterOutComponent } from './register-out.component';

describe('RegisterOutComponent', () => {
  let component: RegisterOutComponent;
  let fixture: ComponentFixture<RegisterOutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterOutComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
