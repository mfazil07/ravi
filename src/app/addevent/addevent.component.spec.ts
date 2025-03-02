import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { SearchComponent } from '../search/search.component';
import { FormsModule, NgModel } from '@angular/forms';
import { ClrComboboxModule, ClrDatagridModule, ClrDatalistModule, ClrDataModule, ClrDatepickerModule, ClrInputModule, ClrModalModule } from '@clr/angular';
import { AddeventComponent } from '../addevent/addevent.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonService } from '../services/common.service';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { formatDate } from '@angular/common';
import { AlertService, IAlertType } from '../services/alert.service';

describe('AddeventComponent', () => {
  let component: AddeventComponent;
  let fixture: ComponentFixture<AddeventComponent>;
  let commonService: jasmine.SpyObj<CommonService>;
  let alertService: jasmine.SpyObj<AlertService>;

  const activatedRouteMock = {
    queryParams: of({ userName: 'RBALANZ' }),
  };

  beforeEach(async () => {
    const commonServiceSpy = jasmine.createSpyObj('CommonService', [
      'getUserAuthorization',
      'getallCountries',
      'getUsStates',
      'getAllWeatherTypes',
      'addWeatherEvent',
    ]);

    const alertServiceSpy = jasmine.createSpyObj('AlertService', ['show']);
    const searchComponentSpy = jasmine.createSpyObj('SearchComponent', ['searchSubmit']);
    const formSpy = jasmine.createSpyObj('form', ['get', 'enable']);

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
        ClrModalModule,
        HttpClientTestingModule,
      ],
      providers: [
        { provide: CommonService, useValue: commonServiceSpy },
        { provide: AlertService, useValue: alertServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: SearchComponent, useValue: searchComponentSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AddeventComponent);
    component = fixture.componentInstance;
    commonService = TestBed.inject(CommonService) as jasmine.SpyObj<CommonService>;
    alertService = TestBed.inject(AlertService) as jasmine.SpyObj<AlertService>;

    // Mock the service methods
    commonService.getallCountries.and.returnValue(
      of([
        { countryCode: 'US', countryName: 'United States', key: 'USA', value: 'United States' },
        { countryCode: 'CA', countryName: 'Canada', key: 'Canada', value: 'Canada' },
      ])
    );

    commonService.getUsStates.and.returnValue(
      of([
        { countryCode: 'CA', countryName: 'California', key: 'California', value: 'CA' },
        { countryCode: 'TX', countryName: 'Texas', key: 'Texas', value: 'TX' },
      ])
    );

    commonService.getAllWeatherTypes.and.returnValue(
      of([{ weatherTypeCode: 'HURR', weatherName: 'Hurricane', key: 'Hurricane', value: 'Hurricane' }])
    );

    component.weatheraddform = { form: formSpy } as any;

    fixture.detectChanges();
  });

  it('should create Add Event component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize properties and reset form when mode is "add"', () => {
    component.weatherAdd = { frmWeatherAlertId: 123 };
    component.todayDate = '2023-10-01';
    spyOn(component, 'enableFields');

    component.openModal('add');

    expect(component.open).toBeTrue();
    expect(component.eventType).toBe('Add');
    expect(component.weatherAdd.frmWeatherAlertId).toBe(0);
    expect(component.enableFields).toHaveBeenCalled();
  });

  it('should disable specific form controls and set isOtherDisabled to true when disableFields is called', () => {
    component.weatheraddform = {
      form: {
        get: (field: string) => ({ disabled: false, enable: () => {}, disable: () => {} }),
      },
    } as any;

    component.disableFields();

    expect(component.isOtherDisabled).toBeTrue();
  });

  it('should enable all form controls and set isOtherDisabled and isStateDisabled to false when enableFields is called', () => {
    component.weatheraddform = {
      form: {
        enable: jasmine.createSpy('enable'),
        get: (field: string) => ({ disabled: false, enable: () => {}, disable: () => {} }),
      },
    } as any;

    component.disableFields();
    component.enableFields();

    expect(component.isOtherDisabled).toBeFalse();
    expect(component.isStateDisabled).toBeFalse();
    expect(component.weatheraddform.form.enable).toHaveBeenCalled();
  });

  it('should set invalidDate error when frmStartDate is in the past for an Add event', () => {
    component.weatheraddform = {
      controls: {
        frmStartDate: { setErrors: jasmine.createSpy('setErrors') },
        frmEndDate: { setErrors: jasmine.createSpy('setErrors') },
      },
    } as any;

    component.todayDate = formatDate(new Date(), 'yyyy-MM-dd', 'EN-US');
    const mockNgModel = {
      value: '2023-01-01',
      name: 'frmStartDate',
      control: {
        markAsTouched: jasmine.createSpy('markAsTouched'),
        setErrors: jasmine.createSpy('setErrors'),
      },
    } as unknown as NgModel;

    component.eventType = 'Add';
    component.weatherAdd = { frmStartDate: '2023-10-01' };

    component.onDateChange(mockNgModel);

    expect(mockNgModel.control.setErrors).toHaveBeenCalled();
  });

  it('should set invalidMaxEndDate error when frmStartDate is greater than maxStartDate for an Edit event with Upcoming status', () => {
    component.weatheraddform = {
      controls: {
        frmStartDate: { setErrors: jasmine.createSpy('setErrors') },
        frmEndDate: { setErrors: jasmine.createSpy('setErrors') },
      },
    } as any;

    const mockNgModel = {
      value: '2023-12-01',
      name: 'frmStartDate',
      control: {
        markAsTouched: jasmine.createSpy('markAsTouched'),
        setErrors: jasmine.createSpy('setErrors'),
      },
    } as unknown as NgModel;

    component.eventType = 'Edit ';
    component.weatherAdd = {
      isMapped: true,
      eventStatus: 'Upcoming',
      frmStartDate: '2023-11-01',
      maxStartDate: '2023-11-30',
    };

    component.onDateChange(mockNgModel);

    expect(mockNgModel.control.setErrors).toHaveBeenCalled();
  });

  it('should set invalidMinEndDate error when frmEndDate is less than minEndDate', () => {
    component.weatheraddform = {
      controls: {
        frmStartDate: { setErrors: jasmine.createSpy('setErrors') },
        frmEndDate: { setErrors: jasmine.createSpy('setErrors') },
      },
    } as any;

    const mockNgModel = {
      value: '2023-10-01',
      name: 'frmEndDate',
      control: {
        markAsTouched: jasmine.createSpy('markAsTouched'),
        setErrors: jasmine.createSpy('setErrors'),
      },
    } as unknown as NgModel;

    component.eventType = 'Edit ';
    component.weatherAdd = {
      isMapped: true,
      eventStatus: 'Upcoming',
      frmEndDate: '2023-10-15',
      minEndDate: '2023-10-10',
    };

    component.onDateChange(mockNgModel);

    expect(mockNgModel.control.setErrors).toHaveBeenCalled();
  });

  it('should set invalidEndDate error when frmEndDate is less than frmStartDate', () => {
    component.weatheraddform = {
      controls: {
        frmStartDate: { setErrors: jasmine.createSpy('setErrors') },
        frmEndDate: { setErrors: jasmine.createSpy('setErrors') },
      },
    } as any;

    const mockNgModel = {
      value: '2023-10-01',
      name: 'frmEndDate',
      control: {
        markAsTouched: jasmine.createSpy('markAsTouched'),
        setErrors: jasmine.createSpy('setErrors'),
      },
    } as unknown as NgModel;

    component.eventType = 'Edit ';
    component.weatherAdd = {
      isMapped: true,
      eventStatus: 'Upcoming',
      frmStartDate: '2023-10-05',
      frmEndDate: '2023-10-15',
    };

    component.onDateChange(mockNgModel);

    expect(mockNgModel.control.setErrors).toHaveBeenCalled();
  });

  it('should set invalidStartDate error when frmStartDate is greater than frmEndDate', () => {
    component.weatheraddform = {
      controls: {
        frmStartDate: { setErrors: jasmine.createSpy('setErrors') },
        frmEndDate: { setErrors: jasmine.createSpy('setErrors') },
      },
    } as any;

    const mockNgModel = {
      value: '2023-10-20',
      name: 'frmStartDate',
      control: {
        markAsTouched: jasmine.createSpy('markAsTouched'),
        setErrors: jasmine.createSpy('setErrors'),
      },
    } as unknown as NgModel;

    component.eventType = 'Edit ';
    component.weatherAdd = {
      isMapped: true,
      eventStatus: 'Upcoming',
      frmStartDate: '2023-10-15',
      frmEndDate: '2023-10-10',
    };

    component.onDateChange(mockNgModel);

    expect(mockNgModel.control.setErrors).toHaveBeenCalled();
  });

  it('should clear errors when no validation errors are found', () => {
    component.weatheraddform = {
      controls: {
        frmStartDate: { setErrors: jasmine.createSpy('setErrors') },
        frmEndDate: { setErrors: jasmine.createSpy('setErrors') },
      },
    } as any;

    const mockNgModel = {
      value: '2023-10-15',
      name: 'frmEndDate',
      control: {
        markAsTouched: jasmine.createSpy('markAsTouched'),
        setErrors: jasmine.createSpy('setErrors'),
      },
    } as unknown as NgModel;

    component.eventType = 'Edit ';
    component.weatherAdd = {
      isMapped: true,
      eventStatus: 'Upcoming',
      frmStartDate: '2023-10-10',
      frmEndDate: '2023-10-20',
      minEndDate: '2023-10-10',
    };

    component.onDateChange(mockNgModel);

    expect(mockNgModel.control.setErrors).toHaveBeenCalled();
    expect(component.weatheraddform.controls['frmEndDate'].setErrors).toHaveBeenCalled();
    expect(component.weatheraddform.controls['frmStartDate'].setErrors).toHaveBeenCalled();
  });

  it('should handle checkCountries logic correctly', () => {
    component.prevSelectedCountries = [
      { key: 'USA', value: 'United States' },
      { key: 'Canada', value: 'Canada' },
    ];

    const mockValues = [
      { key: 'USA', value: 'United States' },
      { key: 'India', value: 'India' },
    ];

    component.checkCountries(mockValues);

    expect(component.isUSAExist).toBeTrue();

    component.checkCountries(null);
    expect(component.weatherAdd.frmCountry).toEqual(component.prevSelectedCountries);

    const mockValuesWithoutUSA = [
      { key: 'Canada', value: 'Canada' },
      { key: 'India', value: 'India' },
    ];
    component.checkCountries(mockValuesWithoutUSA);
    expect(component.isUSAExist).toBeFalse();
    expect(component.weatherAdd.frmState).toEqual([]);
  });

  it('should handle checkStates logic correctly', () => {
    component.prevSelectedStates = [
      { key: 'California', value: 'CA' },
      { key: 'Texas', value: 'TX' },
    ];

    const mockValues = [{ key: 'California', value: 'CA' }];

    component.checkStates(mockValues);
    expect(component.weatherAdd.frmState).toEqual(component.prevSelectedStates);

    component.checkStates(null);
    expect(component.weatherAdd.frmState).toEqual(component.prevSelectedStates);
  });

  it('should enable disabled fields and submit the form successfully when valid', () => {
    component.weatheraddform = {
      control: {
        markAllAsTouched: jasmine.createSpy('markAllAsTouched'),
      },
      form: {
        get: jasmine.createSpy('get').and.callFake((controlName: string) => ({
          disabled: true,
          enable: jasmine.createSpy('enable'),
        })),
        enable: jasmine.createSpy('enable'),
      },
      valid: true,
      value: {
        frmVaCode: 'VA001',
        frmWeatherEvent: 'Hurricane',
        frmReasons: 'WRC001',
        frmOtherDescription: 'High winds',
        frmCountry: [{ key: 'USA', value: 'United States' }],
        frmState: [{ key: 'California', value: 'CA' }],
        frmLocation: 'Florida',
        frmStartDate: '2023-10-01',
        frmEndDate: '2023-10-10',
        frmDescription: 'Severe weather alert',
      },
      reset: jasmine.createSpy('reset'),
    } as any;

    component.weatherAdd = {
      frmWeatherAlertId: 123,
      resetForm: jasmine.createSpy('resetForm'),
    };

    component.request = {} as any;

    commonService.addWeatherEvent.and.returnValue(of({ success: true }));

    component.onSubmit(component.weatheraddform);

    expect(component.weatheraddform.control.markAllAsTouched).toHaveBeenCalled();
    expect(component.weatherAdd.resetForm).toHaveBeenCalled();
  });

  it('should return "disabled" if country is already selected in getCountryClass', () => {
    component.prevSelectedCountries = [
      { key: 'USA', value: 'United States' },
      { key: 'Canada', value: 'Canada' },
    ];

    const result = component.getCountryClass('USA');
    expect(result).toBe('disabled');
  });

  it('should return null if country is not already selected in getCountryClass', () => {
    component.prevSelectedCountries = [
      { key: 'Canada', value: 'Canada' },
    ];

    const result = component.getCountryClass('USA');
    expect(result).toBeNull();
  });

  it('should return "disabled" if state is already selected in getClass', () => {
    component.prevSelectedStates = [
      { key: 'California', value: 'CA' },
      { key: 'Texas', value: 'TX' },
    ];

    const result = component.getClass('California');
    expect(result).toBe('disabled');
  });

  it('should return null if state is not already selected in getClass', () => {
    component.prevSelectedStates = [
      { key: 'Texas', value: 'TX' },
    ];

    const result = component.getClass('California');
    expect(result).toBeNull();
  });

  it('should handle formData input correctly', () => {
    const formData = {
      vA_WeatherEvent_Code: 'VA001',
      name: 'Hurricane',
      weather_Reason_Code: 'WRC001',
      reason: 'High winds',
      countries: [
        { country: 'USA', usStates: ['California'] },
        { country: 'Canada', usStates: [] },
      ],
      location: 'Florida',
      startDate: '2023-10-01T00:00:00Z',
      endDate: '2023-10-10T00:00:00Z',
      description: 'Severe weather alert',
      weather_Event_Id: 123,
      isMapped: true,
      eventStatus: 'Upcoming',
    };

    component.formData = formData;

    expect(component.weatherAdd).toEqual({
      frmVaCode: 'VA001',
      frmWeatherEvent: 'Hurricane',
      frmReasons: 'WRC001',
      frmOtherDescription: 'High winds',
      frmCountry: [
        { key: 'USA', value: 'United States' },
        { key: 'Canada', value: 'Canada' },
      ],
      frmState: [
        { key: 'California', value: 'California' },
      ],
      frmLocation: 'Florida',
      frmStartDate: formatDate(new Date('2023-10-01T00:00:00Z'), 'yyyy-MM-dd', 'EN-US'),
      frmEndDate: formatDate(new Date('2023-10-10T00:00:00Z'), 'yyyy-MM-dd', 'EN-US'),
      frmDescription: 'Severe weather alert',
      frmWeatherAlertId: 123,
      isMapped: true,
      eventStatus: 'Upcoming',
    });

    expect(component.isUSAExist).toBeTrue();
    
    const resultStartDate = new Date(formData.startDate);
    const resultEndDate = new Date(formData.endDate);

    expect(component.maxStartDate).toBe(formatDate(resultStartDate, 'yyyy-MM-dd', 'EN-US'));
    expect(component.minEndDate).toBe(formatDate(resultEndDate, 'yyyy-MM-dd', 'EN-US'));
    expect(component.minStartDate).toBe('');

    spyOn(component, 'disableFields');
    component.formData = formData;
    expect(component.disableFields).toHaveBeenCalled();
  });

  it('should handle errors correctly in handleError', () => {
    const errorResponses = [
      { status: 500, expectedMessage: 'Weather event list not fetched: contact administrator' },
      { status: 503, expectedMessage: 'Weather event list not fetched: contact administrator' },
      { status: 401, expectedMessage: 'Unauthorized: You are not authorized to perform this action.' },
      { status: 400, error: '', expectedMessage: 'Failed to Add weather alert' },
      { status: 400, error: 'Custom error message', expectedMessage: 'Custom error message' },
    ];
  
    errorResponses.forEach(errorResponse => {
      const err = { status: errorResponse.status, error: errorResponse.error } as HttpErrorResponse;
      alertService.show.calls.reset(); // Reset the spy to avoid "already been spied upon" error
  
      component.handleError(err);
  
      expect(alertService.show).toHaveBeenCalled();
      expect(alertService.show.calls.mostRecent().args[0]).toEqual({
        message: errorResponse.expectedMessage,
        clrAlertType: IAlertType.DANGER,
      });
    });
  });

  it('should set isOtherDescriptionRequired based on the event value in setOtherReasonValidation', () => {
    const mockEvent = { target: { value: 'WEATHER008' } };
    component.setOtherReasonValidation(mockEvent);
  
    expect(component.isOtherDescriptionRequired).toBeTrue();
  
    mockEvent.target.value = 'OTHER';
    component.setOtherReasonValidation(mockEvent);
  
    expect(component.isOtherDescriptionRequired).toBeFalse();
  });

});
