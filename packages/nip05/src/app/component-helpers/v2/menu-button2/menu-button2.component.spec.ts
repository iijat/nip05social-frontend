import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuButton2Component } from './menu-button2.component';

describe('MenuButton2Component', () => {
  let component: MenuButton2Component;
  let fixture: ComponentFixture<MenuButton2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MenuButton2Component],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuButton2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
