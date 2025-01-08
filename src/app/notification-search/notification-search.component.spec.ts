import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationSearchComponent } from './notification-search.component';

describe('NotificationSearchComponent', () => {
  let component: NotificationSearchComponent;
  let fixture: ComponentFixture<NotificationSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NotificationSearchComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NotificationSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
