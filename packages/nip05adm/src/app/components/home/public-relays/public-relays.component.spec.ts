import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PublicRelaysComponent } from './public-relays.component';

describe('PublicRelaysComponent', () => {
  let component: PublicRelaysComponent;
  let fixture: ComponentFixture<PublicRelaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PublicRelaysComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicRelaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
