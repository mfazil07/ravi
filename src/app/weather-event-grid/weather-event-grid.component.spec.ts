import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherEventGridComponent } from './weather-event-grid.component';

describe('WeatherEventGridComponent', () => {
  let component: WeatherEventGridComponent;
  let fixture: ComponentFixture<WeatherEventGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WeatherEventGridComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WeatherEventGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
