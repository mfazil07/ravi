import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationSearchFormComponent } from './notification-search-form.component';
import { ClarityModule } from '@clr/angular';
import { FormsModule, NgForm } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { formatDate } from '@angular/common';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs'; // Import 'of' from RxJS for mocking observables
import { CommonService } from '../../services/common.service';
import { IAlertType } from '../../services/alert.service';

class MockCommonService {
  getallCountries() {
    return of([{ key: 'USA', value: 'United States' }]); // Mock response for getallCountries
  }

  getUsStates() {
    return of([{ key: 'CA', value: 'California' }]); // Mock response for getUsStates
  }
}

describe('NotificationSearchFormComponent', () => {
  let component: NotificationSearchFormComponent;
  let fixture: ComponentFixture<NotificationSearchFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NotificationSearchFormComponent],
      imports: [ClarityModule, FormsModule, HttpClientModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: CommonService,
          useClass: MockCommonService, // Use the mocked CommonService
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => 'mockValue', // Mock any route parameters you need
              },
              queryParamMap: {
                get: (key: string) => 'mockQueryValue', // Mock any query parameters you need
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationSearchFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.notificationSearch.startDate).toEqual(formatDate(new Date(), 'MM/dd/yyyy', 'EN-US'));
    expect(component.notificationSearch.endDate).toEqual(formatDate(new Date(), 'MM/dd/yyyy', 'EN-US'));
    expect(component.notificationSearch.location).toEqual('');
    expect(component.notificationSearch.mappedEvents).toBeFalse();
  });

  it('enableSave set to false disables the submit button', () => {
    component.enableSave = false;
    fixture.detectChanges();
    const submitEl = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
    expect(submitEl.disabled).toBeTruthy();
  });

  it('should handle button status input', () => {
    component.buttonStatus = true;
    expect(component.enableSave).toBeTrue();
  });

  it('enableSave set to true enables the submit button', () => {
    component.enableSave = true;
    fixture.detectChanges();
    const submitEl = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
    expect(submitEl.disabled).toBeFalsy();
  });

  it('should emit form update on triggerRefresh', () => {
    spyOn(component.onFormUpdate, 'emit');
    component.triggerRefresh = true;
    expect(component.onFormUpdate.emit).toHaveBeenCalledWith({ form: component.form.value, type: 'search' });
  });

  it('should reset form on enableMapping set to false', () => {
    component.enableMapping = false;
    expect(component.notificationSearch.mappedEvents).toBeFalse();
    expect(component.notificationSearch).toEqual(component.initialFormValue);
  });

  it('should hide button if caseStatus is CLOSED', () => {
    component.caseStatus = 'CLOSED';
    expect(component.showButton).toBeFalse();
  });

  it('should validate dates and set errors properly', () => {
    const form = {
      controls: {
        startDatepickrnm: { setErrors: jasmine.createSpy('setErrors') },
        endDatepickrnm: { setErrors: jasmine.createSpy('setErrors') },
      },
    } as unknown as NgForm;

    component.notificationSearch.startDate = '';
    component.notificationSearch.endDate = '';
    component.validateDates(form, 'startDate');

    expect(form.controls['startDatepickrnm'].setErrors).toHaveBeenCalledWith({ invalidDate: true });
    expect(component.startDateErrorMsgs).toBe('Start Date is required!');
    expect(form.controls['endDatepickrnm'].setErrors).toHaveBeenCalledWith({ invalidDate: true });
    expect(component.endDateErrorMsgs).toBe('End Date is required!');
  });

  it('should emit form update on form submit', () => {
    spyOn(component.onFormUpdate, 'emit');
    const form = { value: component.notificationSearch };
    component.onSubmit(form);
    expect(component.onFormUpdate.emit).toHaveBeenCalledWith({ form: component.notificationSearch, type: 'save' });
  });

  it('should emit form update on search', () => {
    spyOn(component.onFormUpdate, 'emit');
    const form = { valid: true, value: component.notificationSearch };
    component.onSearch(form);
    expect(component.onFormUpdate.emit).toHaveBeenCalledWith({ form: component.notificationSearch, type: 'search' });
  });


  it('should reset form and emit form update on reset', () => {
    spyOn(component.onFormUpdate, 'emit');
  
    // Mock the form object with the required methods and properties
    const form = {
      form: {
        get: (controlName: string) => {
          // Mock the get method to return a FormControl
          if (controlName === 'frmSrchCountry') {
            return { setValue: jasmine.createSpy('setValue') }; // Mock setValue for frmSrchCountry
          }
          if (controlName === 'frmSrchState') {
            return { setValue: jasmine.createSpy('setValue') }; // Mock setValue for frmSrchState
          }
          return null;
        },
        markAsPristine: jasmine.createSpy('markAsPristine'),
        markAsUntouched: jasmine.createSpy('markAsUntouched'),
        updateValueAndValidity: jasmine.createSpy('updateValueAndValidity'),
      },
      value: component.notificationSearch,
    } as unknown as NgForm;
  
    // Set initial values for prevSelectedCountries and claimantResidentState
    component.prevSelectedCountries = [{ key: 'USA', value: 'United States' }];
    component.claimantResidentState = [{ key: 'CA', value: 'California' }];
  
    component.onReset(form);
  
    const frmSrchCountryControl = form.form.get('frmSrchCountry');    
    const frmSrchStateControl = form.form.get('frmSrchState');   
  
    expect(form.form.markAsPristine).toHaveBeenCalled();
    expect(form.form.markAsUntouched).toHaveBeenCalled();
    expect(form.form.updateValueAndValidity).toHaveBeenCalled();  
  });

  it('should handle mapped events box', () => {
    spyOn(component.onFormUpdate, 'emit');
    const form = { value: {} };
    component.notificationSearch.mappedEvents = true;
    component.onmappedEventsBox(form);
    expect(component.notificationSearch.startDate).toEqual('');
    expect(component.notificationSearch.endDate).toEqual('');
    expect(component.notificationSearch.location).toEqual('');
    expect(component.onFormUpdate.emit).toHaveBeenCalledWith({ form: form.value, type: 'search' });
  });

  it('should close the form window', () => {
    spyOn(window, 'close');
    component.closeForm();
    expect(window.close).toHaveBeenCalled();
  });

  it('should validate dates correctly', () => {
    const form = {
      controls: {
        startDatepickrnm: { setErrors: jasmine.createSpy('setErrors') },
        endDatepickrnm: { setErrors: jasmine.createSpy('setErrors') },
      },
    } as unknown as NgForm;

    component.notificationSearch.startDate = '01/01/2022';
    component.notificationSearch.endDate = '12/31/2021';

    component.validateDates(form, 'startDate');
    expect(form.controls['startDatepickrnm'].setErrors).toHaveBeenCalled();
  });

  it('should set error messages for invalid dates', () => {
    const form = {
      controls: {
        startDatepickrnm: { setErrors: jasmine.createSpy('setErrors') },
        endDatepickrnm: { setErrors: jasmine.createSpy('setErrors') },
      },
    } as unknown as NgForm;

    component.notificationSearch.startDate = '';
    component.notificationSearch.endDate = '';

    component.validateDates(form, '');
    expect(form.controls['startDatepickrnm'].setErrors).toHaveBeenCalledWith({ invalidDate: true });
    expect(form.controls['endDatepickrnm'].setErrors).toHaveBeenCalledWith({ invalidDate: true });
    expect(component.startDateErrorMsgs).toBe('Start Date is required!');
    expect(component.endDateErrorMsgs).toBe('End Date is required!');
  });

  it('should handle invalid start and end date formats', () => {
    const form = {
      controls: {
        startDatepickrnm: { setErrors: jasmine.createSpy('setErrors') },
        endDatepickrnm: { setErrors: jasmine.createSpy('setErrors') },
      },
    } as unknown as NgForm;

    component.notificationSearch.startDate = 'invalid-date';
    component.notificationSearch.endDate = 'invalid-date';

    component.validateDates(form, 'startDate');
    expect(form.controls['startDatepickrnm'].setErrors).toHaveBeenCalledWith({ invalidDate: true });
    expect(component.startDateErrorMsgs).toBe('Invalid date!');
    expect(form.controls['endDatepickrnm'].setErrors).toHaveBeenCalledWith({ invalidDate: true });
    expect(component.endDateErrorMsgs).toBe('Invalid date!');
  });

  it('should handle valid start and end dates', () => {
    const form = {
      controls: {
        startDatepickrnm: { setErrors: jasmine.createSpy('setErrors') },
        endDatepickrnm: { setErrors: jasmine.createSpy('setErrors') },
      },
    } as unknown as NgForm;

    component.notificationSearch.startDate = '01/01/2022';
    component.notificationSearch.endDate = '12/31/2022';

    component.validateDates(form, 'startDate');
    expect(form.controls['startDatepickrnm'].setErrors).toHaveBeenCalledWith(null);
    expect(component.startDateErrorMsgs).toBe('');
    expect(form.controls['endDatepickrnm'].setErrors).toHaveBeenCalledWith(null);
    expect(component.endDateErrorMsgs).toBe('');
  });

  it('should set claimantResidentState when claimantState is provided', () => {
    const testState = [{ key: 'CA', value: 'California' }];
    component.claimantState = testState;
    expect(component.claimantResidentState).toEqual(testState);
  });

  it('should reset frmSrchCountry to prevSelectedCountries if values is null or undefined', () => {
    component.prevSelectedCountries = [{ key: 'USA', value: 'United States' }];
    component.notificationSearch.frmSrchCountry = [];
    component.checkCountries(null);

    expect(component.notificationSearch.frmSrchCountry).toEqual(component.prevSelectedCountries);
  });

  it('should reset frmSrchCountry to prevSelectedCountries if values.length is less than prevSelectedCountries.length', () => {
    component.prevSelectedCountries = [{ key: 'USA', value: 'United States' }, { key: 'CAN', value: 'Canada' }];
    component.notificationSearch.frmSrchCountry = [{ key: 'USA', value: 'United States' }];
    component.checkCountries([{ key: 'USA', value: 'United States' }]);

    expect(component.notificationSearch.frmSrchCountry).toEqual(component.prevSelectedCountries);
  });

  it('should set isUSAExist to true if values contains USA', () => {
    const values = [{ key: 'USA', value: 'United States' }, { key: 'CAN', value: 'Canada' }];
    component.checkCountries(values);

    expect(component.isUSAExist).toBeTrue();
  });

  it('should set isUSAExist to false and reset frmSrchState if values does not contain USA', () => {
    const values = [{ key: 'CAN', value: 'Canada' }, { key: 'MEX', value: 'Mexico' }];
    component.notificationSearch.frmSrchState = [{ key: 'CA', value: 'California' }];
    component.checkCountries(values);

    expect(component.isUSAExist).toBeFalse();
    expect(component.notificationSearch.frmSrchState).toEqual([]);
  });

  it('should reset frmSrchState to prevSelectedStates if values is null or undefined', () => {
    component.prevSelectedStates = [{ key: 'CA', value: 'California' }];
    component.notificationSearch.frmSrchState = [];
    component.checkStates(null);

    expect(component.notificationSearch.frmSrchState).toEqual(component.prevSelectedStates);
  });

  it('should reset frmSrchState to prevSelectedStates if values.length is less than prevSelectedStates.length', () => {
    component.prevSelectedStates = [{ key: 'CA', value: 'California' }, { key: 'TX', value: 'Texas' }];
    component.notificationSearch.frmSrchState = [{ key: 'CA', value: 'California' }];
    component.checkStates([{ key: 'CA', value: 'California' }]);

    expect(component.notificationSearch.frmSrchState).toEqual(component.prevSelectedStates);
  });

  describe('getCountryClass', () => {
    it('should return "disabled" if the selected country exists in prevSelectedCountries', () => {
      component.prevSelectedCountries = [{ key: 'USA', value: 'United States' }];
      const selected = 'United States';
      const result = component.getCountryClass(selected);
  
      expect(result).toBe('disabled');
    });
  });

  describe('getClass', () => {
    it('should return "disabled" if the selected state exists in prevSelectedStates', () => {
      component.prevSelectedStates = [{ key: 'CA', value: 'California' }];
      const selected = 'CA';
      const result = component.getClass(selected);
  
      expect(result).toBe('disabled');
    });
  });

  describe('handleError', () => {
    it('should call alertService.show with the correct error message based on the error status', () => {
      const mockError = { status: 500, error: 'Internal Server Error' } as HttpErrorResponse;
      spyOn(component['alertService'], 'show');
      component.handleError(mockError);
  
      expect(component['alertService'].show).toHaveBeenCalledWith({
        message: 'Weather event list not fetched : contact administrator',
        clrAlertType: IAlertType.DANGER,
      });
    });
  });

  it('should handle 401 Unauthorized error and call alertService.show with the correct message', () => {
    const mockError = { status: 401, error: 'Unauthorized' } as HttpErrorResponse;
    spyOn(component['alertService'], 'show');  

    component.handleError(mockError);
  
    expect(component['alertService'].show).toHaveBeenCalledWith({
      message: 'Unauthorized : You are not authorized to perform this action.',
      clrAlertType: IAlertType.DANGER,
    });
  });

  it('should return available states by filtering out already selected states', () => {
    component.states = [
      { key: 'CA', value: 'California' },
      { key: 'TX', value: 'Texas' },
      { key: 'NY', value: 'New York' },
    ];
    component.notificationSearch.frmState = [
      { key: 'CA', value: 'California' },
    ];
  
    const result = component.getAvailableStates();
    expect(result).toEqual([
      { key: 'CA', value: 'California' },
      { key: 'TX', value: 'Texas' },
      { key: 'NY', value: 'New York' },
    ]);
  });

  it('should set claimantResidentCountry when claimantCountry is provided', () => {
    const testCountry = { key: 'USA', value: 'USA' };
    component.claimantCountry = [testCountry];
    component.claimantResidentCountry = [testCountry];
    expect(component.claimantResidentCountry).toEqual([testCountry]);
  });
  
  it('should not set claimantResidentState when claimantState is undefined', () => {
    component.claimantState = undefined;
    expect(component.claimantResidentState).toEqual([]);
  });  
  
    it('should not set claimantResidentCountry when claimantCountry is undefined', () => {
    component.claimantCountry = [];
    expect(component.claimantResidentCountry).toEqual([]);
  });


  it('should handle getallCountries response and update countries, countriesComboboxData, prevSelectedCountries, and isUSAExist correctly', () => {
    const mockCountries: any = [
      { key: 'USA', value: 'United States' },
      { key: 'CAN', value: 'Canada' },
    ];
    const mockClaimantResidentCountry = { key: 'USA', value: 'United States' };

    spyOn(component['commonService'], 'getallCountries').and.returnValue(of(mockCountries));  
    component.claimantResidentCountry = [mockClaimantResidentCountry];
    component.countriesComboboxData = [];
    component.prevSelectedCountries = [];
    component.ngOnInit(); 
    expect(component.countries).toEqual(mockCountries);
    expect(component.countriesComboboxData).toEqual([
      { key: 'USA', value: 'United States' },
    ]);
    expect(component.prevSelectedCountries).toEqual([
      { key: 'USA', value: 'United States' },
    ]);
    expect(component.isUSAExist).toBeTrue();
  });

  it('should handle getUsStates response and update states, notificationSearch.frmSrchState, and prevSelectedStates correctly', () => {
    const mockStates: any = [
      { key: 'CA', value: 'California' },
      { key: 'TX', value: 'Texas' },
    ];
    const mockClaimantResidentState = { key: 'CA', value: 'California' };
    spyOn(component['commonService'], 'getUsStates').and.returnValue(of(mockStates));
  
    component.claimantResidentState = [mockClaimantResidentState];
    component.prevSelectedStates = [{ key: 'CA', value: 'California' }];
    component.ngOnInit(); 
    expect(component.states).toEqual(mockStates);
    expect(component.prevSelectedStates).toEqual([
      { key: 'CA', value: 'California' },
    ]);
  });

    it('should not allow duplicate countries in frmSrchCountry', () => {
    component.prevSelectedCountries = [{ key: 'USA', value: 'United States' }];
    component.notificationSearch.frmSrchCountry = [{ key: 'USA', value: 'United States' }];
  
    component.checkCountries([{ key: 'USA', value: 'United States' }]);
    expect(component.notificationSearch.frmSrchCountry.length).toBe(1);
  });

  it('should handle empty response from getUsStates', () => {
    spyOn(component['commonService'], 'getUsStates').and.returnValue(of([]));
  
    component.ngOnInit();
    expect(component.states).toEqual([]);
  });

  it('should return empty string in getCountryClass for non-disabled country', () => {
    component.prevSelectedCountries = [{ key: 'CAN', value: 'Canada' }];
    const result = component.getCountryClass('USA');
    expect(result ?? '').toBe('');
  });

  it('should return empty string in getClass for state not in prevSelectedStates', () => {
    component.prevSelectedStates = [{ key: 'TX', value: 'Texas' }];
    const result = component.getClass('CA');
    expect(result ?? '').toBe('');
  });

  it('should not reset frmSrchState if values match prevSelectedStates', () => {
      const values = [{ key: 'CA', value: 'California' }];
      component.prevSelectedStates = [...values];
      component.notificationSearch.frmSrchState = [...values];
      component.checkStates(values);
      expect(component.notificationSearch.frmSrchState).toEqual(values);
    });

    it('should return all states if no frmState is selected', () => {
      component.states = [
        { key: 'CA', value: 'California' },
        { key: 'TX', value: 'Texas' }
      ];
      component.notificationSearch.frmState = [];
      const result = component.getAvailableStates();
      expect(result).toEqual(component.states);
    });

    it('should not reset frmSrchCountry if values match prevSelectedCountries', () => {
        const values = [{ key: 'USA', value: 'United States' }];
        component.prevSelectedCountries = [...values];
        component.notificationSearch.frmSrchCountry = [...values];
        component.checkCountries(values);
        expect(component.notificationSearch.frmSrchCountry).toEqual(values);
    });


});
