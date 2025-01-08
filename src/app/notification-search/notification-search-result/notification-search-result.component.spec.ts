import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationSearchResultComponent } from './notification-search-result.component';

describe('NotificationSearchResultComponent', () => {
  let component: NotificationSearchResultComponent;
  let fixture: ComponentFixture<NotificationSearchResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NotificationSearchResultComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NotificationSearchResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
