import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Plans2Component } from './plans2.component';

describe('Plans2Component', () => {
  let component: Plans2Component;
  let fixture: ComponentFixture<Plans2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Plans2Component],
    }).compileComponents();

    fixture = TestBed.createComponent(Plans2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
