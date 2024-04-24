import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlbyInvoiceDialogComponent } from './alby-invoice-dialog.component';

describe('AlbyInvoiceDialogComponent', () => {
  let component: AlbyInvoiceDialogComponent;
  let fixture: ComponentFixture<AlbyInvoiceDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AlbyInvoiceDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AlbyInvoiceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
