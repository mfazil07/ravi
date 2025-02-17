import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchComponent } from './search.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ClrComboboxModule, ClrDatagridModule, ClrDatalistModule, ClrDataModule, ClrDatepickerModule, ClrInputModule, ClrModalModule } from '@clr/angular';
import { AddeventComponent } from '../addevent/addevent.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { CommonService } from '../services/common.service';
import { of } from 'rxjs';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  let commonService: jasmine.SpyObj<CommonService>;

  beforeEach(async () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000; // Increase timeout interval

    const commonServiceSpy = jasmine.createSpyObj('CommonService', ['getallWeatherEvents']);

    await TestBed.configureTestingModule({
      declarations: [SearchComponent, AddeventComponent],
      imports: [
        HttpClientModule,
        FormsModule,
        ClrComboboxModule,
        ClrDatalistModule,
        ClrDatepickerModule,
        ClrInputModule,
        ClrDatagridModule,
        ClrDataModule,
        ClrModalModule
      ],
      providers: [{ provide: CommonService, useValue: commonServiceSpy }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    commonService = TestBed.inject(CommonService) as jasmine.SpyObj<CommonService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show state dropdown if USA selected', async () => {
    try {
      component.weathersearch.country = [{ countryName: 'United States of America', countryCode: 'usa' }];
      component.countryChanged();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      const stateDropdownEl = fixture.debugElement.query(By.css('select[name="frmState"]'));
      expect(stateDropdownEl).not.toBeNull();
      if (stateDropdownEl) {
        expect(stateDropdownEl.nativeElement).toBeTruthy();
      }
    } catch (error) {
      console.error('Test case error:', error);
      throw error;
    }
  });

  it('form submit', () => {
    const mockResult: any = {
      data: [
        { startDate: 1728561703122, WeatherAlertID: '001', endDate: 1733952000000, weatherEvent: 'Storm X', weatherType: 'Storm', description: 'Storm Description', location: 'Location X', country: 'USA' }
      ]
    };
    commonService.getallWeatherEvents.and.returnValue(of(mockResult));

    const mockForm = {
      value: {
        country: 'USA',
        weatherTypenm: 'Storm',
        frmSrchStDt: '2023-01-01',
        frmSrchEndDt: '2023-12-31',
        frmSrchLocation: 'New York'
      },
      form: {
        markAsPristine: jasmine.createSpy('markAsPristine'),
        markAsUntouched: jasmine.createSpy('markAsUntouched'),
        updateValueAndValidity: jasmine.createSpy('updateValueAndValidity')
      }
    };

    component.onSubmit(mockForm);

    expect(component.weatherResult).toEqual(mockResult);
    expect(component.weatherEvents).toEqual(mockResult.data);
    expect(component.filterEnabled).toBeTrue();
  });
});
