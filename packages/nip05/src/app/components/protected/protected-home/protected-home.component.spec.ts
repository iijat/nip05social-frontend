import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProtectedHomeComponent } from './protected-home.component';

describe('ProtectedHomeComponent', () => {
  let component: ProtectedHomeComponent;
  let fixture: ComponentFixture<ProtectedHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProtectedHomeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProtectedHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
