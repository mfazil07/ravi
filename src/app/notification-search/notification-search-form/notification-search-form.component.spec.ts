import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationSearchFormComponent } from './notification-search-form.component';
import { FormsModule, ReactiveFormsModule, NgForm } from '@angular/forms';
import { formatDate } from '@angular/common';
import { By } from '@angular/platform-browser';

describe('NotificationSearchFormComponent', () => {
  let component: NotificationSearchFormComponent;
  let fixture: ComponentFixture<NotificationSearchFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NotificationSearchFormComponent],
      imports: [FormsModule, ReactiveFormsModule]
    }).compileComponents();
  });

  beforeEach(() => {
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

  it('should handle button status input', () => {
    component.buttonStatus = true;
    expect(component.enableSave).toBeTrue();
  });

  it('should handle trigger refresh input', () => {
    spyOn(component.onFormUpdate, 'emit');
    component.triggerRefresh = true;
    expect(component.onFormUpdate.emit).toHaveBeenCalledWith({ form: component.form.value, type: 'search' });
  });

  it('should handle enable mapping input', () => {
    component.enableMapping = false;
    expect(component.enableMapEvent).toBeFalse();
    expect(component.notificationSearch.mappedEvents).toBeFalse();
  });

  it('should handle case status input', () => {
    component.caseStatus = 'CLOSED';
    expect(component.showButton).toBeFalse();
  });

  it('should handle form submit', () => {
    spyOn(component.onFormUpdate, 'emit');
    const form = { value: { startDate: '01/01/2022', endDate: '12/31/2022', location: 'Test', mappedEvents: false } };
    component.onSubmit(form);
    expect(component.onFormUpdate.emit).toHaveBeenCalledWith({ form: form.value, type: 'save' });
  });

  it('should handle search form', () => {
    spyOn(component.onFormUpdate, 'emit');
    const form = { valid: true, value: { startDate: '01/01/2022', endDate: '12/31/2022', location: 'Test', mappedEvents: false } };
    component.onSearch(form);
    expect(component.onFormUpdate.emit).toHaveBeenCalledWith({ form: form.value, type: 'search' });
  });

  it('should reset the form', () => {
    spyOn(component.onFormUpdate, 'emit');
    const form = {
      form: {
        markAsPristine: jasmine.createSpy('markAsPristine'),
        markAsUntouched: jasmine.createSpy('markAsUntouched'),
        updateValueAndValidity: jasmine.createSpy('updateValueAndValidity')
      },
      value: {}
    };
    component.onReset(form);
    expect(component.notificationSearch).toEqual(component.initialFormValue);
    expect(form.form.markAsPristine).toHaveBeenCalled();
    expect(form.form.markAsUntouched).toHaveBeenCalled();
    expect(form.form.updateValueAndValidity).toHaveBeenCalled();
    expect(component.onFormUpdate.emit).toHaveBeenCalledWith({ form: form.value, type: 'reset' });
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

  it('should close the form', () => {
    spyOn(window, 'close');
    component.closeForm();
    expect(window.close).toHaveBeenCalled();
  });

  it('should validate dates correctly', () => {
    const form = {
      controls: {
        startDatepickrnm: { setErrors: jasmine.createSpy('setErrors') },
        endDatepickrnm: { setErrors: jasmine.createSpy('setErrors') }
      }
    } as unknown as NgForm;

    component.notificationSearch.startDate = '01/01/2022';
    component.notificationSearch.endDate = '12/31/2021';

    component.validateDates(form, 'startDate');
    expect(form.controls.startDatepickrnm.setErrors).toHaveBeenCalledWith({ invalidDate: true });
    expect(component.startDateErrorMsgs).toBe('Start Date must be less than End Date!');
  });

  it('should set error messages for invalid dates', () => {
    const form = {
      controls: {
        startDatepickrnm: { setErrors: jasmine.createSpy('setErrors') },
        endDatepickrnm: { setErrors: jasmine.createSpy('setErrors') }
      }
    } as unknown as NgForm;

    component.notificationSearch.startDate = '';
    component.notificationSearch.endDate = '';

    component.validateDates(form, '');
    expect(form.controls.startDatepickrnm.setErrors).toHaveBeenCalledWith({ invalidDate: true });
    expect(form.controls.endDatepickrnm.setErrors).toHaveBeenCalledWith({ invalidDate: true });
    expect(component.startDateErrorMsgs).toBe('Start Date is required!');
    expect(component.endDateErrorMsgs).toBe('End Date is required!');
  });

  it('should handle invalid start and end date formats', () => {
    const form = {
      controls: {
        startDatepickrnm: { setErrors: jasmine.createSpy('setErrors') },
        endDatepickrnm: { setErrors: jasmine.createSpy('setErrors') }
      }
    } as unknown as NgForm;

    component.notificationSearch.startDate = 'invalid-date';
    component.notificationSearch.endDate = 'invalid-date';

    component.validateDates(form, 'startDate');
    expect(form.controls.startDatepickrnm.setErrors).toHaveBeenCalledWith({ invalidDate: true });
    expect(component.startDateErrorMsgs).toBe('Invalid date!');
    expect(form.controls.endDatepickrnm.setErrors).toHaveBeenCalledWith({ invalidDate: true });
    expect(component.endDateErrorMsgs).toBe('Invalid date!');
  });

  it('should handle valid start and end dates', () => {
    const form = {
      controls: {
        startDatepickrnm: { setErrors: jasmine.createSpy('setErrors') },
        endDatepickrnm: { setErrors: jasmine.createSpy('setErrors') }
      }
    } as unknown as NgForm;

    component.notificationSearch.startDate = '01/01/2022';
    component.notificationSearch.endDate = '12/31/2022';

    component.validateDates(form, 'startDate');
    expect(form.controls.startDatepickrnm.setErrors).toHaveBeenCalledWith(null);
    expect(component.startDateErrorMsgs).toBe('');
    expect(form.controls.endDatepickrnm.setErrors).toHaveBeenCalledWith(null);
    expect(component.endDateErrorMsgs).toBe('');
  });
});
