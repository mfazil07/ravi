import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationSearchFormComponent } from './notification-search-form.component';

describe('NotificationSearchFormComponent', () => {
  let component: NotificationSearchFormComponent;
  let fixture: ComponentFixture<NotificationSearchFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NotificationSearchFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NotificationSearchFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
