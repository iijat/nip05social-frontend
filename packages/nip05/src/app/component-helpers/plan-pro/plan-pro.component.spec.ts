import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlanProComponent } from './plan-pro.component';

describe('PlanProComponent', () => {
  let component: PlanProComponent;
  let fixture: ComponentFixture<PlanProComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlanProComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlanProComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
