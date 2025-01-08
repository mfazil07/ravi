import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QtcFooterComponent } from './qtc-footer.component';

describe('QtcFooterComponent', () => {
  let component: QtcFooterComponent;
  let fixture: ComponentFixture<QtcFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QtcFooterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(QtcFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
