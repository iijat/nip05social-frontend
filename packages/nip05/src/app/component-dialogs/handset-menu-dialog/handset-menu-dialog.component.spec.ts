import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HandsetMenuDialogComponent } from './handset-menu-dialog.component';

describe('HandsetMenuDialogComponent', () => {
  let component: HandsetMenuDialogComponent;
  let fixture: ComponentFixture<HandsetMenuDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HandsetMenuDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HandsetMenuDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
