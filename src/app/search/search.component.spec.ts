import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchComponent } from './search.component';
import { CommonService } from '../services/common.service';
import { ConfirmDialogService } from '../services/confirm-dialog.service';
import { AlertService } from '../services/alert.service';
import { ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { AddeventComponent } from '../addevent/addevent.component';
import { HttpErrorResponse } from '@angular/common/http';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  let commonServiceMock: any;
  let confirmDialogServiceMock: any;
  let alertServiceMock: any;
  let changeDetectorRefMock: any;
  let activatedRouteMock: any;
  let routerMock: any;
  let locationMock: any;

  beforeEach(async () => {
    commonServiceMock = {
      getUserAuthorization: jasmine.createSpy().and.returnValue(of(['ADD', 'MODIFY', 'DELETE', 'READ'])),
      getallCountries: jasmine.createSpy().and.returnValue(of([])),
      getUsStates: jasmine.createSpy().and.returnValue(of([])),
      refreshRequest$: of({}),
      getAllWeatherTypes: jasmine.createSpy().and.returnValue(of([])),
      getallWeatherEvents: jasmine.createSpy().and.returnValue(of([])),
      deleteWeatherAlert: jasmine.createSpy().and.returnValue(of({})),
      getWeatherEvent: jasmine.createSpy().and.returnValue(of({}))
    };

    confirmDialogServiceMock = {
      confirm: jasmine.createSpy().and.returnValue(Promise.resolve(true))
    };

    alertServiceMock = {
      show: jasmine.createSpy()
    };

    changeDetectorRefMock = {
      detectChanges: jasmine.createSpy()
    };

    activatedRouteMock = {
      queryParams: of({})
    };

    routerMock = {
      navigate: jasmine.createSpy()
    };

    locationMock = {
      replaceState: jasmine.createSpy()
    };

    await TestBed.configureTestingModule({
      declarations: [SearchComponent, AddeventComponent],
      imports: [HttpClientTestingModule, FormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: CommonService, useValue: commonServiceMock },
        { provide: ConfirmDialogService, useValue: confirmDialogServiceMock },
        { provide: AlertService, useValue: alertServiceMock },
        { provide: ChangeDetectorRef, useValue: changeDetectorRefMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: Router, useValue: routerMock },
        { provide: Location, useValue: locationMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getUserAuthorization on ngOnInit', () => {
    component.ngOnInit();
    expect(commonServiceMock.getUserAuthorization).toHaveBeenCalled();
  });

  it('should handle unauthorized user on getUserAuthorization error', () => {
    commonServiceMock.getUserAuthorization.and.returnValue(throwError({ status: 401 }));
    component.ngOnInit();
    expect(routerMock.navigate).toHaveBeenCalled();
    expect(component.loading).toBeFalse();
  });

  it('should call getallCountries on successful authorization', () => {
    component.ngOnInit();
    expect(commonServiceMock.getallCountries).toHaveBeenCalled();
  });

  it('should handle getallCountries error', () => {
    commonServiceMock.getallCountries.and.returnValue(throwError({ status: 500 }));
    component.ngOnInit();
    expect(alertServiceMock.show).toHaveBeenCalled();
  });

  it('should call getUsStates on successful authorization', () => {
    component.ngOnInit();
    expect(commonServiceMock.getUsStates).toHaveBeenCalled();
  });

  it('should handle getUsStates error', () => {
    commonServiceMock.getUsStates.and.returnValue(throwError({ status: 500 }));
    component.ngOnInit();
    expect(alertServiceMock.show).toHaveBeenCalled();
  });

  it('should call getAllWeatherTypes on ngOnInit', () => {
    component.ngOnInit();
    expect(commonServiceMock.getAllWeatherTypes).toHaveBeenCalled();
  });

  it('should handle getAllWeatherTypes error', () => {
    commonServiceMock.getAllWeatherTypes.and.returnValue(throwError({ status: 500 }));
    component.ngOnInit();
    expect(alertServiceMock.show).toHaveBeenCalled();
  });

  it('should call searchSubmit on reset', () => {
    spyOn(component, 'searchSubmit');
    component.reset({ form: { markAsPristine: jasmine.createSpy(), markAsUntouched: jasmine.createSpy(), updateValueAndValidity: jasmine.createSpy() } });
    expect(component.searchSubmit).toHaveBeenCalled();
  });

  it('should call confirmDialogService.confirm on onDelete', async () => {
    await component.onDelete({ weatherAlertID: 1, isMapped: false });
    expect(confirmDialogServiceMock.confirm).toHaveBeenCalled();
  });

  it('should call deleteWeatherAlert on confirm', async () => {
    await component.onDelete({ weatherAlertID: 1, isMapped: false });
    expect(commonServiceMock.deleteWeatherAlert).toHaveBeenCalled();
  });

  it('should handle deleteWeatherAlert error', async () => {
    commonServiceMock.deleteWeatherAlert.and.returnValue(throwError({ status: 500 }));
    await component.onDelete({ weatherAlertID: 1, isMapped: false });
    expect(alertServiceMock.show).toHaveBeenCalled();
  });

  it('should call getWeatherEvent on editEntry', () => {
    component.editEntry({ weatherAlertID: 1, isMapped: false, eventStatus: '' });
    expect(commonServiceMock.getWeatherEvent).toHaveBeenCalled();
  });

  it('should handle getWeatherEvent error', () => {
    commonServiceMock.getWeatherEvent.and.returnValue(throwError({ status: 500 }));
    component.editEntry({ weatherAlertID: 1, isMapped: false, eventStatus: '' });
    expect(alertServiceMock.show).toHaveBeenCalled();
  });

  it('should refresh weather events on refreshWeatherEvents', () => {
    component.refreshWeatherEvents();
    expect(commonServiceMock.getallWeatherEvents).toHaveBeenCalled();
  });



  it('should call countryChanged on ngOnInit', () => {
    spyOn(component, 'countryChanged');
    component.ngOnInit();
    expect(component.countryChanged).toHaveBeenCalled();
  });

  it('should call handleError on HttpErrorResponse', () => {
    spyOn(component, 'handleError');
    commonServiceMock.getallCountries.and.returnValue(throwError(new HttpErrorResponse({ status: 500 })));
    component.ngOnInit();
    expect(component.handleError).toHaveBeenCalled();
  });

  it('should handle 401 error in handleError', () => {
    const errorResponse = new HttpErrorResponse({
      status: 401,
      error: 'Unauthorized'
    });
  
    component.handleError(errorResponse);
    expect(alertServiceMock.show).toHaveBeenCalled();
  });
  
  it('should handle default error in handleError', () => {
    const errorResponse = new HttpErrorResponse({
      status: 500,
      error: 'Internal Server Error'
    });
  
    component.handleError(errorResponse);
    expect(alertServiceMock.show).toHaveBeenCalled();
  });


  it('should validate date fields in checkDates method', () => {
    component.weathersearch = {
      frmSrchStDt: '',
      frmSrchEndDt: '',
    };
    component.checkDates();
    expect(component.startDateError).toBeTrue();
    expect(component.endDateError).toBeTrue();
    expect(component.endDateErrorMsgs).toBe('End Date is required!');
    expect(component.enableSearch).toBeTrue();

    component.weathersearch = {
      frmSrchStDt: '02/30/2025',
      frmSrchEndDt: '03/01/2025',
    };
    component.checkDates();
    expect(component.startDateError).toBeTrue();
    expect(component.endDateError).toBeFalse();
    expect(component.endDateErrorMsgs).toBe('');
    expect(component.enableSearch).toBeFalse();

    component.weathersearch = {
      frmSrchStDt: '02/28/2025',
      frmSrchEndDt: '02/27/2025',
    };
    component.checkDates();
    expect(component.startDateError).toBeTrue();
    expect(component.endDateError).toBeFalse();
    expect(component.endDateErrorMsgs).toBe('');
    expect(component.enableSearch).toBeFalse();

    component.weathersearch = {
      frmSrchStDt: '02/26/2025',
      frmSrchEndDt: '02/27/2025',
    };
    component.checkDates();
    expect(component.startDateError).toBeFalse();
    expect(component.startDateErrorMsgs).toBe('');
    expect(component.endDateError).toBeFalse();
    expect(component.endDateErrorMsgs).toBe('');
    expect(component.enableSearch).toBeTrue();
  });

  it('should not submit form if there are date errors', () => {
    spyOn(component, 'checkDates');
    spyOn(component, 'searchSubmit');

    // Mock form object with invalid dates
    const formMock = {
      value: {
        frmSrchCountry: [{ key: 'USA', value: 'UNITED STATES OF AMERICA' }],
        weatherTypenm: 'Rain',
        startDatepickrnm: '02/28/2025',
        endDatepickrnm: '02/27/2025', // End date is before start date
        location: 'New York',
        frmSrchState: [{ key: 'NY', value: 'New York' }],
        activeBox: true
      }
    };

    // Submit the form with date errors
    component.startDateError = false;
    component.endDateError = false;
    component.onSubmit(formMock);
    expect(component.weatherResult.data).toBeNull();
  });

  it('should call getUserAuthorization on ngOnInit', () => {
    component.ngOnInit();
    expect(commonServiceMock.getUserAuthorization).toHaveBeenCalled();
  });

  it('should handle unauthorized user on getUserAuthorization error', () => {
    commonServiceMock.getUserAuthorization.and.returnValue(throwError({ status: 401 }));
    component.ngOnInit();
    expect(routerMock.navigate).toHaveBeenCalled();
    expect(component.loading).toBeFalse();
  });

  it('should call getallCountries on successful authorization', () => {
    component.ngOnInit();
    expect(commonServiceMock.getallCountries).toHaveBeenCalled();
  });

  it('should handle getallCountries error', () => {
    commonServiceMock.getallCountries.and.returnValue(throwError({ status: 500 }));
    component.ngOnInit();
    expect(alertServiceMock.show).toHaveBeenCalled();
  });

  it('should call getUsStates on successful authorization', () => {
    component.ngOnInit();
    expect(commonServiceMock.getUsStates).toHaveBeenCalled();
  });

  it('should handle getUsStates error', () => {
    commonServiceMock.getUsStates.and.returnValue(throwError({ status: 500 }));
    component.ngOnInit();
    expect(alertServiceMock.show).toHaveBeenCalled();
  });

  it('should call getAllWeatherTypes on ngOnInit', () => {
    component.ngOnInit();
    expect(commonServiceMock.getAllWeatherTypes).toHaveBeenCalled();
  });

  it('should handle getAllWeatherTypes error', () => {
    commonServiceMock.getAllWeatherTypes.and.returnValue(throwError({ status: 500 }));
    component.ngOnInit();
    expect(alertServiceMock.show).toHaveBeenCalled();
  });


});
