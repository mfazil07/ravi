import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QtcHeaderComponent } from './qtc-header.component';

describe('QtcHeaderComponent', () => {
  let component: QtcHeaderComponent;
  let fixture: ComponentFixture<QtcHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QtcHeaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(QtcHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
