import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlanAdvancedComponent } from './plan-advanced.component';

describe('PlanAdvancedComponent', () => {
  let component: PlanAdvancedComponent;
  let fixture: ComponentFixture<PlanAdvancedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlanAdvancedComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlanAdvancedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
